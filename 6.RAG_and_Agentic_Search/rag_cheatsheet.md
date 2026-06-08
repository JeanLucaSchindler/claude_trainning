# RAG Cheat Sheet

## What is RAG?

Retrieval-Augmented Generation (RAG):

```text
User Question
↓
Retrieve Relevant Documents
↓
Add Context to Prompt
↓
Claude Answers
```

Purpose:
- Use private/company data
- Reduce hallucinations
- Ground responses in facts

---

## 1. Chunking

Split documents into smaller pieces before indexing.

### Size-Based
- Fixed length chunks
- Works everywhere
- Add overlap

### Structure-Based
- Split by headers/sections
- Best for Markdown/docs

### Sentence-Based
- Group sentences
- Good default

### Semantic
- Group by meaning
- Highest quality
- Most expensive

Rule:
- Docs → Structure
- General text → Sentence
- Universal fallback → Size + overlap

---

## 2. Embeddings

Convert text into vectors.

```text
"Software Engineering"
↓
[0.12, 0.83, ...]
```

Embeddings capture meaning, not keywords.

Used for:
- Semantic search
- Similarity search
- Retrieval

---

## 3. Semantic Search

```text
Document
↓
Embedding
↓
Vector DB

User Query
↓
Embedding
↓
Similarity Search
↓
Relevant Chunks
```

Finds conceptually similar content.

---

## 4. Vector Database

Stores:

```text
Embedding
+
Original Text
```

Examples:
- Pinecone
- Weaviate
- Qdrant
- Chroma
- pgvector

---

## 5. Cosine Similarity

Measures similarity between vectors.

```text
1.0 = identical
0.0 = unrelated
-1.0 = opposite
```

Higher similarity = better match.

Cosine Distance:

```text
1 - cosine similarity
```

Lower distance = better match.

---

## 6. Full RAG Flow

### Indexing

```text
Documents
↓
Chunking
↓
Embeddings
↓
Vector DB
```

### Retrieval

```text
User Question
↓
Query Embedding
↓
Vector Search
↓
Top Chunks
↓
Prompt
↓
Claude
```

---

## 7. Implementing RAG

1. Chunk documents
2. Generate embeddings
3. Store vectors
4. Embed query
5. Search
6. Build prompt
7. Call Claude

---

## 8. BM25 Lexical Search

Semantic search can miss exact IDs.

Example:

```text
INC-2023-Q4-011
```

BM25 focuses on exact term matching.

Best for:
- IDs
- Ticket numbers
- Product codes
- Exact keywords

---

## 9. Hybrid Search

Best practice:

```text
Semantic Search
+
BM25 Search
```

Semantic:
- Meaning

BM25:
- Exact matches

Together:
- Better retrieval

---

## 10. Multi-Index RAG

```text
User Query
↓
Vector Index
↓
BM25 Index
↓
Merge Results
↓
Claude
```

---

## 11. Reciprocal Rank Fusion (RRF)

Combines rankings from multiple search systems.

```text
RRF = Σ 1/(k + rank)
```

Documents ranking well across systems move to the top.

---

## Production Architecture

```text
Documents
↓
Chunking
↓
Embeddings
↓
Vector DB
↓
Semantic Search
+
BM25 Search
↓
RRF Fusion
↓
Prompt Construction
↓
Claude
```

---

## Golden Rules

1. Chunk well.
2. Use overlap.
3. Store original text with embeddings.
4. Use cosine similarity.
5. Add BM25.
6. Prefer hybrid retrieval.
7. Only retrieve the most relevant chunks.
