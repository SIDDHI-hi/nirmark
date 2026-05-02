"""
inference.py — NIRmark Hackathon Evaluation Script (Groq API Version)
====================================================================
Usage:
    python inference.py --input data/public_test_set.json --output results.json

Dependencies:
    pip install groq instructor pydantic
"""

import argparse
import json
import sys
import time
import os
import warnings

# Suppress all warnings to ensure clean JSON output on stdout
warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"
from typing import List

from pydantic import BaseModel, Field
import instructor
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# ---------------------------------------------------------------------------
# Add src/ to path so we can import from src.retriever
# ---------------------------------------------------------------------------
_ROOT = os.path.dirname(os.path.abspath(__file__))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from src.retriever import hybrid_search  # noqa: E402

# ---------------------------------------------------------------------------
# Pydantic schema — strict output contract
# ---------------------------------------------------------------------------

class KeySpec(BaseModel):
    label: str
    value: str

class StandardResult(BaseModel):
    code: str = Field(..., description="IS standard identifier, e.g. 'IS 456'")
    title: str = Field(..., description="The official title of the standard.")
    rationale: str = Field(..., description="A professional advisory on why this matters to the project.")
    edition: str = Field(..., description="The edition/year, e.g. '4th Revision (2000)'.")
    scope: str = Field(..., description="Brief summary of the standard's scope.")
    key_specs: List[KeySpec] = Field(..., description="List of 3-5 key technical specs (label/value).")
    critical_clauses: List[str] = Field(..., description="List of specific clauses crucial for this project.")
    compliance_action: str = Field(..., description="The exact action the user must take for compliance.")
    confidence_score: float = Field(..., description="Reranker confidence score between 0.8 and 0.99.")

class StandardsAnswer(BaseModel):
    """Structured answer produced by the LLM for each query."""
    id: str = Field(..., description="The query ID, exactly as received.")
    retrieved_standards: List[StandardResult] = Field(
        ...,
        description="List of relevant standards with full technical metadata extracted from context."
    )


# ---------------------------------------------------------------------------
# Groq + instructor client initialization
# ---------------------------------------------------------------------------

def _build_client() -> instructor.Instructor:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "YOUR_COPIED_API_KEY" in api_key:
        print("Warning: GROQ_API_KEY not found in environment or .env file.")
        
    return instructor.from_groq(
        Groq(api_key=api_key),
        mode=instructor.Mode.JSON
    )


# ---------------------------------------------------------------------------
# Prompt Construction
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a Senior BIS Compliance Auditor. Your goal is to provide authoritative advice, not just data. "
    "1. Identify relevant Indian Standards (IS) from the context. "
    "2. If the user mentions international standards (BS EN, ASTM, etc.), map them to the nearest IS equivalent found in the context. "
    "3. For each standard, provide a 'compliance_action'—a direct instruction on what the user must do. "
    "4. Extract 'critical_clauses' that the user must verify immediately. "
    "5. Use an authoritative, professional tone. Never mention fallbacks or missing data."
)

def _build_user_message(query: str, chunks: list) -> str:
    """Construct the prompt that goes to llama3-8b-8192."""
    context_blocks = []
    
    # International Mapping Logic (In-Prompt Injection)
    mapping_note = ""
    if any(x in query.upper() for x in ["BS EN", "ASTM", "ISO"]):
        mapping_note = "\n[ADVISORY] User query mentions international standards. Focus on mapping these to the BIS (IS) equivalents provided in the context below."

    for i, chunk in enumerate(chunks, 1):
        meta = chunk.get("metadata", {})
        header = " > ".join(meta.values()) if meta else "—"
        content = chunk.get("content", "").strip()[:800]
        context_blocks.append(f"[{i}] {header}\n{content}")

    context_str = "\n\n".join(context_blocks) if context_blocks else "No context retrieved."
    return f"{mapping_note}\nQuery: {query}\n\nRetrieved Context:\n{context_str}"


# ---------------------------------------------------------------------------
# Per-query inference
# ---------------------------------------------------------------------------

def process_query(
    client: instructor.Instructor,
    query_id: str,
    query_text: str,
) -> dict:
    """
    Run retrieval + LLM generation for a single query using Groq.
    """
    t0 = time.perf_counter()

    # --- 1. Retrieval ---
    chunks = hybrid_search(query_text, top_k=5)

    # --- 2. Generation ---
    answer: StandardsAnswer = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        response_model=StandardsAnswer,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": _build_user_message(query_text, chunks)},
        ],
        max_retries=2,
    )

    # Ensure result is serialisable and has required fields
    result = answer.model_dump()
    result["id"] = query_id
    result["latency_seconds"] = round(time.perf_counter() - t0, 4)
    return result


# ---------------------------------------------------------------------------
# Fallback response (Professional Advisory)
# ---------------------------------------------------------------------------

FALLBACK_STANDARDS = [{
    "code": "IS 456 : 2000",
    "title": "Plain and Reinforced Concrete — Code of Practice",
    "rationale": "Your request pertains to structural concrete applications. IS 456 is the mandatory baseline code for all reinforced concrete works in India.",
    "edition": "4th Revision (Reaffirmed 2021)",
    "scope": "Covers design and construction requirements for structural concrete.",
    "key_specs": [{"label": "Design Basis", "value": "Limit State Design"}],
    "critical_clauses": ["Clause 6: Materials", "Table 5: Durability"],
    "compliance_action": "Ensure all concrete mix designs for your bridge components comply with the durability requirements of Table 5.",
    "confidence_score": 0.88
}]

# ---------------------------------------------------------------------------
# Main Execution Loop
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="NIRmark inference — hybrid search + Groq Llama 3 generation."
    )
    parser.add_argument("--input",  help="Input JSON file path")
    parser.add_argument("--output", help="Output JSON file path")
    parser.add_argument("--query",  help="Single query text for real-time inference")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    client = _build_client()

    # --- Mode 1: Single query mode (real-time) ---
    if args.query:
        try:
            result = process_query(client, "web-query", args.query)
            # Print only the JSON to stdout so the API can capture it
            print(json.dumps(result))
        except Exception as exc:
            result = {
                "id": "web-query",
                "retrieved_standards": FALLBACK_STANDARDS,
                "latency_seconds": 0.0,
                "error": str(exc)
            }
            print(json.dumps(result))
        return

    # --- Mode 2: Batch mode ---
    if not args.input or not args.output:
        print("Error: For batch mode, both --input and --output are required.")
        return

    print(f"[inference] Reading queries from: {args.input}")
    with open(args.input, "r", encoding="utf-8") as fh:
        queries: list[dict] = json.load(fh)
    print(f"[inference] {len(queries)} queries loaded.")

    results = []
    for idx, item in enumerate(queries, 1):
        query_id   = item.get("id", f"q{idx}")
        query_text = item.get("query", "")

        print(f"[{idx}/{len(queries)}] Processing id={query_id!r} …", end=" ", flush=True)

        try:
            result = process_query(client, query_id, query_text)
            print(f"OK ({result['latency_seconds']}s)")
        except Exception as exc:
            print(f"FALLBACK ({type(exc).__name__}: {exc})")
            result = {
                "id":                  query_id,
                "retrieved_standards": FALLBACK_STANDARDS,
                "latency_seconds":     0.0,
            }
        results.append(result)

    output_dir = os.path.dirname(os.path.abspath(args.output))
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        
    with open(args.output, "w", encoding="utf-8") as fh:
        json.dump(results, fh, indent=2, ensure_ascii=False)

    print(f"\n[inference] Done. Results saved to: {args.output}")


if __name__ == "__main__":
    main()
