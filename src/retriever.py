"""
RAG Hybrid Search Retriever — NIRmark
======================================
Combines:
  • Dense  : LanceDB  + BAAI/bge-small-en-v1.5  (sentence-transformers)
  • Sparse : BM25     + rank_bm25
  • Fusion : Reciprocal Rank Fusion (RRF)

Dependencies (install before running):
    pip install lancedb sentence-transformers rank-bm25 pyarrow

Usage:
    from src.retriever import ingest_to_db, hybrid_search

    ingest_to_db("data/parsed_chunks.json")          # run once
    results = hybrid_search("your query here", top_k=5)
"""

import os
import json
import pickle
import re
from typing import Optional

import numpy as np
import lancedb
import pyarrow as pa
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi


# ---------------------------------------------------------------------------
# Paths — resolved relative to THIS file's location
# ---------------------------------------------------------------------------
_SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR     = os.path.normpath(os.path.join(_SCRIPT_DIR, "..", "data"))
LANCEDB_PATH  = os.path.join(_DATA_DIR, "lancedb")
CHUNKS_PATH   = os.path.join(_DATA_DIR, "parsed_chunks.json")
BM25_IDX_PATH = os.path.join(_DATA_DIR, "bm25_index.pkl")

TABLE_NAME    = "nirmark_chunks"
EMBED_MODEL   = "BAAI/bge-small-en-v1.5"

# Reciprocal Rank Fusion constant — 60 is the standard value
RRF_K = 60

# ---------------------------------------------------------------------------
# Singletons (loaded lazily so imports are cheap)
# ---------------------------------------------------------------------------
_embedder: Optional[SentenceTransformer] = None
_bm25: Optional[BM25Okapi] = None
_bm25_ids: Optional[list[str]] = None       # maps BM25 row index → chunk id
_lancedb_table = None


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        print(f"[embedder] Loading '{EMBED_MODEL}' …")
        _embedder = SentenceTransformer(EMBED_MODEL)
    return _embedder


def _get_lancedb_table():
    global _lancedb_table
    if _lancedb_table is None:
        db = lancedb.connect(LANCEDB_PATH)
        _lancedb_table = db.open_table(TABLE_NAME)
    return _lancedb_table


def _load_bm25() -> tuple[BM25Okapi, list[str]]:
    global _bm25, _bm25_ids
    if _bm25 is None:
        if not os.path.exists(BM25_IDX_PATH):
            raise FileNotFoundError(
                f"BM25 index not found at {BM25_IDX_PATH}. "
                "Run ingest_to_db() first."
            )
        with open(BM25_IDX_PATH, "rb") as fh:
            payload = pickle.load(fh)
        _bm25     = payload["bm25"]
        _bm25_ids = payload["ids"]
    return _bm25, _bm25_ids


# ---------------------------------------------------------------------------
# Tokeniser (simple, no NLTK dependency)
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    """Lowercase + split on non-alphanumeric characters."""
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()


# ---------------------------------------------------------------------------
# Ingestion
# ---------------------------------------------------------------------------

def ingest_to_db(json_path: str = CHUNKS_PATH) -> None:
    """
    Read parsed_chunks.json and populate:
      • LanceDB table (with dense embeddings)
      • BM25 index    (pickled to data/bm25_index.pkl)
    Safe to re-run — will drop and recreate the table.
    """
    print(f"[ingest] Loading chunks from: {json_path}")
    with open(json_path, "r", encoding="utf-8") as fh:
        chunks: list[dict] = json.load(fh)

    embedder = _get_embedder()
    texts    = [c["content"] for c in chunks]
    ids      = [c["id"]      for c in chunks]

    # --- Dense embeddings -------------------------------------------------
    print(f"[ingest] Embedding {len(texts)} chunks …")
    embeddings = embedder.encode(texts, show_progress_bar=True, normalize_embeddings=True)
    embed_dim  = embeddings.shape[1]

    # --- Build LanceDB schema & table ------------------------------------
    print("[ingest] Writing LanceDB table …")
    db = lancedb.connect(LANCEDB_PATH)

    schema = pa.schema([
        pa.field("id",        pa.utf8()),
        pa.field("content",   pa.utf8()),
        pa.field("metadata",  pa.utf8()),          # JSON-serialised dict
        pa.field("vector",    pa.list_(pa.float32(), embed_dim)),
    ])

    records = [
        {
            "id":       chunk["id"],
            "content":  chunk["content"],
            "metadata": json.dumps(chunk.get("metadata", {})),
            "vector":   emb.tolist(),
        }
        for chunk, emb in zip(chunks, embeddings)
    ]

    # Drop existing table so ingest is idempotent
    if TABLE_NAME in db.table_names():
        db.drop_table(TABLE_NAME)

    tbl = db.create_table(TABLE_NAME, data=records, schema=schema)
    print(f"[ingest] LanceDB table '{TABLE_NAME}' created with {tbl.count_rows()} rows.")

    # --- Build BM25 index ------------------------------------------------
    print("[ingest] Building BM25 index …")
    tokenized = [_tokenize(t) for t in texts]
    bm25      = BM25Okapi(tokenized)

    os.makedirs(_DATA_DIR, exist_ok=True)
    with open(BM25_IDX_PATH, "wb") as fh:
        pickle.dump({"bm25": bm25, "ids": ids}, fh)

    print(f"[ingest] BM25 index saved to: {BM25_IDX_PATH}")
    print("[ingest] Ingestion complete ✓")


# ---------------------------------------------------------------------------
# Individual search functions
# ---------------------------------------------------------------------------

def _dense_search(query: str, top_k: int) -> list[dict]:
    """Return ranked results from LanceDB vector search."""
    embedder = _get_embedder()
    tbl      = _get_lancedb_table()

    q_vec = embedder.encode([query], normalize_embeddings=True)[0].tolist()
    rows  = (
        tbl.search(q_vec)
           .limit(top_k)
           .select(["id", "content", "metadata"])
           .to_list()
    )
    # Attach rank (0-indexed, lower = better)
    return [{"rank": i, **r} for i, r in enumerate(rows)]


def _sparse_search(query: str, top_k: int) -> list[dict]:
    """Return ranked results from BM25 keyword search."""
    bm25, ids = _load_bm25()

    tokens = _tokenize(query)
    scores = bm25.get_scores(tokens)

    # Top-k by BM25 score (descending)
    ranked_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for rank, idx in enumerate(ranked_indices):
        results.append(
            {
                "rank":    rank,
                "id":      ids[idx],
                "bm25_score": float(scores[idx]),
            }
        )
    return results


# ---------------------------------------------------------------------------
# Reciprocal Rank Fusion
# ---------------------------------------------------------------------------

def _rrf_fuse(
    dense_hits: list[dict],
    sparse_hits: list[dict],
    top_k: int,
) -> list[str]:
    """
    Combine dense and sparse result lists using RRF.
    Returns a list of chunk IDs ordered by fused score (best first).
    """
    rrf_scores: dict[str, float] = {}

    for hit in dense_hits:
        chunk_id = hit["id"]
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + 1.0 / (RRF_K + hit["rank"] + 1)

    for hit in sparse_hits:
        chunk_id = hit["id"]
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + 1.0 / (RRF_K + hit["rank"] + 1)

    ranked = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return [chunk_id for chunk_id, _ in ranked[:top_k]]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def hybrid_search(query: str, top_k: int = 5) -> list[dict]:
    """
    Run dense + sparse search and fuse results with RRF.

    Returns a list of up to `top_k` dicts:
        {
            "id":       "chunk_N",
            "content":  "...",
            "metadata": {...}   # dict (deserialised from JSON)
        }
    """
    fetch_k = max(top_k * 3, 20)   # over-fetch so RRF has candidates to rank

    dense_hits  = _dense_search(query,  top_k=fetch_k)
    sparse_hits = _sparse_search(query, top_k=fetch_k)
    fused_ids   = _rrf_fuse(dense_hits, sparse_hits, top_k=top_k)

    # Fetch full content for fused IDs from LanceDB
    tbl    = _get_lancedb_table()
    id_set = set(fused_ids)

    formatted_ids = "(" + ", ".join([f"'{cid}'" for cid in fused_ids]) + ")"
    rows = (
        tbl.search()
           .where(f"id IN {formatted_ids}", prefilter=True)
           .select(["id", "content", "metadata"])
           .limit(len(id_set))
           .to_list()
    )

    # Index by id so we can restore RRF order
    row_map = {r["id"]: r for r in rows}

    results = []
    for chunk_id in fused_ids:
        if chunk_id in row_map:
            row = row_map[chunk_id]
            results.append(
                {
                    "id":      row["id"],
                    "content": row["content"],
                    "metadata": json.loads(row.get("metadata", "{}")),
                }
            )

    return results


# ---------------------------------------------------------------------------
# Entry point — quick smoke-test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    # Step 1: ingest (only needed once; skip with --no-ingest flag)
    if "--no-ingest" not in sys.argv:
        ingest_to_db(CHUNKS_PATH)

    # Step 2: example query
    query = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") \
            else "What are the main findings?"

    print(f"\n[search] Query: {query!r}")
    hits = hybrid_search(query, top_k=5)

    print(f"[search] Top {len(hits)} result(s):\n")
    for i, hit in enumerate(hits, 1):
        meta_str = " > ".join(hit["metadata"].values()) if hit["metadata"] else "—"
        preview  = hit["content"][:200].replace("\n", " ")
        print(f"  [{i}] {hit['id']}  |  {meta_str}")
        print(f"       {preview} …\n")
