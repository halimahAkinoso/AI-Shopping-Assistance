from dotenv import load_dotenv
import os
load_dotenv()

from chromadb.utils import embedding_functions

import chromadb
from chromadb.utils import embedding_functions
import os

client = chromadb.PersistentClient(path="./data/vector_db")
ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"
)
collection = client.get_collection(name="products", embedding_function=ef)

def search_products(query_text, n_results=3):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results