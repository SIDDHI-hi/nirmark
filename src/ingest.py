"""
RAG Ingestion Pipeline — NIRmark
=================================
Reads dataset.pdf, converts it to Markdown (preserving tables),
splits on Markdown headers, and writes structured chunks to JSON.

Dependencies (install before running):
    pip install pymupdf4llm langchain langchain-text-splitters

Usage:
    python src/ingest.py
"""

import os
import json

import pymupdf4llm
from langchain_text_splitters import MarkdownHeaderTextSplitter


# ---------------------------------------------------------------------------
# Path resolution — always relative to THIS file's location
# ---------------------------------------------------------------------------
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH    = os.path.normpath(os.path.join(_SCRIPT_DIR, "..", "data", "dataset.pdf"))
OUTPUT_PATH = os.path.normpath(os.path.join(_SCRIPT_DIR, "..", "data", "parsed_chunks.json"))


# ---------------------------------------------------------------------------
# Core pipeline steps
# ---------------------------------------------------------------------------

def pdf_to_markdown(pdf_path: str) -> str:
    """Convert a PDF to a single Markdown string using pymupdf4llm."""
    print(f"[1/3] Reading PDF: {pdf_path}")
    md_text = pymupdf4llm.to_markdown(pdf_path)
    print(f"      Done — {len(md_text):,} characters extracted.")
    return md_text


def split_markdown(md_text: str) -> list:
    """
    Split Markdown text on H1 / H2 / H3 headers only.
    No character-count or token-count chunking is applied.
    """
    print("[2/3] Splitting on Markdown headers (#, ##, ###) …")

    headers_to_split_on = [
        ("#",   "Header 1"),
        ("##",  "Header 2"),
        ("###", "Header 3"),
    ]

    splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False,   # keep headers inside the chunk content
    )

    docs = splitter.split_text(md_text)
    print(f"      Done — {len(docs)} chunk(s) produced.")
    return docs


def build_chunk_records(docs: list) -> list[dict]:
    """
    Convert LangChain Document objects into plain dicts:
        {
            "id":       "chunk_0",
            "metadata": { <header keys> },
            "content":  "<markdown text>"
        }
    """
    records = []
    for idx, doc in enumerate(docs):
        records.append(
            {
                "id":       f"chunk_{idx}",
                "metadata": doc.metadata,   # e.g. {"Header 1": "...", "Header 2": "..."}
                "content":  doc.page_content,
            }
        )
    return records


def save_chunks(records: list[dict], output_path: str) -> None:
    """Persist the chunk records as a JSON file."""
    print(f"[3/3] Saving {len(records)} chunk(s) to: {output_path}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(records, fh, indent=2, ensure_ascii=False)
    print("      Done — ingestion complete.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    md_text  = pdf_to_markdown(PDF_PATH)
    docs     = split_markdown(md_text)
    records  = build_chunk_records(docs)
    save_chunks(records, OUTPUT_PATH)
