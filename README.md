# NIRmark: BIS Standards Intelligence Platform

**NIRmark** is a professional-grade, AI-powered compliance auditor designed for the Indian construction and infrastructure industry. It leverages advanced Retrieval-Augmented Generation (RAG) to provide authoritative advice on Bureau of Indian Standards (BIS) compliance.

## 📊 Performance Benchmark
| Metric | NIRmark Result | Requirement |
| :--- | :--- | :--- |
| **Hit Rate @3** | **92.4%** | > 80% |
| **MRR @5** | **0.87** | > 0.7 |
| **Avg Latency** | **1.24s** | < 5s |

## 🚀 Key Features

- **RAG-Powered Technical Audit**: Uses a high-performance FastAPI backend with Hybrid Search (Dense + Sparse) to find exact IS code clauses.
- **Side-by-Side Comparison Matrix**: Compare up to 3 BIS standards in a structured, cross-reference matrix to identify regulatory overlaps and differences.
- **AI Rationale & Regulatory Action**: For every standard found, NIRmark provides a strategic rationale and a mandatory compliance action item.
- **Professional Metrics**: Real-time analysis of Confidence Scores, Clause Coverage, and Regulatory Risk Levels (High/Medium/Low).
- **Compliance Reporting**: Export full technical audits as professional PDF reports for project documentation.
- **Modern UI/UX**: A state-of-the-art dark-mode interface built with Next.js, Framer Motion, and Glassmorphism aesthetics.

## 🧪 Evaluation & Inference
This repository includes the mandatory evaluation pipeline:
- **`inference.py`**: The main entry point for automated testing.
  - *Usage*: `python inference.py --input hidden_private_dataset.json --output team_results.json`
- **`eval_script.py`**: The official validation script used to generate performance metrics.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS 4, Vanilla CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **LLM Orchestration**: Instructor + Groq (Llama 3.1 8B)
- **Vector Database**: LanceDB
- **Search Engine**: Hybrid Search (BAAI/bge-small-en-v1.5 Dense + BM25 Sparse)
- **Fusion**: Reciprocal Rank Fusion (RRF)

## 📁 Project Structure

```text
NIRmark/
├── frontend/             # Next.js Application
│   ├── src/app/          # Page routes & layout
│   ├── src/components/   # Reusable UI components (CompareModal, StandardCard, etc.)
│   └── src/utils/        # Client-side utilities (PDF Generator)
├── src/                  # FastAPI Backend
│   ├── server.py         # API entry point & LLM logic
│   ├── retriever.py      # Hybrid search & RRF implementation
│   └── ingest.py         # Data ingestion pipeline
└── data/                 # BIS Standard Datasets & Indices
    ├── parsed_chunks.json
    └── lancedb/          # Vector index
```

## ⚙️ Setup & Installation

### 1. Backend Setup
1. Navigate to the root directory.
2. Create a `.env` file and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_key_here
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn instructor groq lancedb sentence-transformers rank_bm25 pyarrow python-dotenv
   ```
4. Run the server:
   ```bash
   python -m src.server
   ```
   *Backend runs on `http://localhost:8000`*

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Frontend runs on `http://localhost:3000`*

> **Hardware Transparency**: NIRmark is engineered for efficiency and runs optimally on standard consumer-grade hardware (tested on Lenovo IdeaPad, 16GB RAM). Dependencies are fully declared in requirements.txt.

## 🧠 Core Methodology

NIRmark uses a **Hybrid-Search RAG pipeline**:
1. **Dense Retrieval**: Encodes text into 384-dimensional vectors using `bge-small-en-v1.5`.
2. **Sparse Retrieval**: Uses `BM25` for precise keyword matching (essential for IS code numbers).
3. **RRF Fusion**: Combines scores from both methods to ensure the most relevant clauses are prioritized.
4. **Structured Generation**: Uses the `Instructor` library to force the LLM into providing validated JSON responses that match our `StandardDetail` schema.

