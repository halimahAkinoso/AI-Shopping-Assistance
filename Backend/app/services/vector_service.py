from dotenv import load_dotenv
import os
load_dotenv()

import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path

# Resolve the vector_db path relative to this file so it works regardless of cwd
_VECTOR_DB_PATH = str(Path(__file__).parent.parent.parent / "data" / "vector_db")

def _get_collection():
    """Return a fresh ChromaDB collection handle each time (avoids stale references)."""
    client = chromadb.PersistentClient(path=_VECTOR_DB_PATH)
    ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="text-embedding-3-small"
    )
    return client.get_collection(name="products", embedding_function=ef)

def search_products(query_text, n_results=3):
    collection = _get_collection()
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results