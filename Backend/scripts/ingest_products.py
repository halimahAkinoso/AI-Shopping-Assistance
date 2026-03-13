import json
import os
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions

load_dotenv()  # Load your OpenAI/Gemini API key

# 1. Initialize ChromaDB client (stores data in backend/data/vector_db)
client = chromadb.PersistentClient(path="./data/vector_db")

# 2. Define the Embedding Function (How text becomes math)
# Using OpenAI as an example; you can use HuggingFace for free local ones
ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"
)

# delete existing products collection so metadata (including image) can be refreshed
try:
    client.delete_collection(name="products")
except Exception:
    pass

collection = client.get_or_create_collection(
    name="products", embedding_function=ef)


def load_products():
    with open("./data/products.json", "r") as f:
        products = json.load(f)

    ids = [p["id"] for p in products]
    # We combine name + description so the AI understands the context
    documents = [
        f"{p['name']}: {p['description']} Category: {p['category']}" for p in products]
    metadatas = [
        {
            "price": p["price"],
            "name": p["name"],
            "category": p["category"],
            "description": p["description"],
            "image": p.get("image")
        }
        for p in products]

    # 3. Add to Vector Store
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    print(f"Successfully indexed {len(ids)} products.")


if __name__ == "__main__":
    load_products()
