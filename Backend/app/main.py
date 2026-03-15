from dotenv import load_dotenv
from pathlib import Path
import asyncio
import re
from fastapi.responses import StreamingResponse
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
# allow importing when running as package or from app folder directly
try:
    from app.services.vector_service import search_products
except ImportError:
    from services.vector_service import search_products
import json
from fastapi import FastAPI
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# schema imports support package vs script execution
try:
    from app.models.schemas import Product, ChatRequest, ChatResponse
except ImportError:
    from models.schemas import Product, ChatRequest, ChatResponse
from typing import List


class PaymentRequest(BaseModel):
    amount: float
    items: List[Product]


# --- PRODUCT QUERY DETECTION ---
# Only show products when the user's message contains product-related keywords.
# Everything else (greetings, small talk, thanks, etc.) gets a plain chat reply.
_PRODUCT_KEYWORDS = {
    # shopping intent
    "buy", "shop", "purchase", "order", "price", "cost", "cheap", "expensive",
    "discount", "sale", "deal", "offer",
    # product actions
    "find", "need", "want", "looking", "show", "recommend", "suggest", "search",
    "available", "stock", "get", "fetch", "list",
    # categories
    "electronics", "footwear", "shoes", "sneakers", "boots", "sandals", "loafers",
    "accessories", "apparel", "clothing", "clothes", "fitness", "home",
    # specific product types
    "headphone", "headset", "earphone", "watch", "smartwatch", "keyboard", "mouse",
    "monitor", "laptop", "charger", "speaker", "bulb", "mic", "microphone", "ssd",
    "bag", "backpack", "wallet", "belt", "glasses", "stand", "pillow",
    "jacket", "coat", "shirt", "tee", "trousers", "pants", "shorts", "socks",
    "yoga", "dumbbell", "kettlebell", "resistance", "tent", "camping", "scale",
    "purifier", "kettle", "knife", "lamp", "shaver", "lock",
    "product", "item", "catalog", "collection",
}

def is_product_query(message: str) -> bool:
    """Return True only if the message appears to be a product-related request."""
    words = set(message.lower().split())
    # Also check substrings for compound words (e.g. "headphones", "sneakers")
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in _PRODUCT_KEYWORDS)


load_dotenv()

# Get the base directory
BASE_DIR = Path(__file__).parent.parent

app = FastAPI()

# --- CORS SECTION ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow the deployed frontend URL (set via FRONTEND_URL env var on Render)
_frontend_url = os.getenv("FRONTEND_URL")
if _frontend_url:
    origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---


@app.get("/products", response_model=List[Product])
async def get_products():
    products_path = BASE_DIR / "data" / "products.json"
    with open(products_path, "r") as f:
        return json.load(f)


@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    # Only search for products if the message is product-related
    if not is_product_query(request.message):
        # Pure conversational message — reply naturally, no product cards
        prompt = ChatPromptTemplate.from_template(
            "You are a friendly e-commerce shopping assistant called ShopperAI. "
            "Reply naturally and helpfully to the user's message: {question}"
        )
        chain = prompt | llm
        ai_answer = chain.invoke({"question": request.message})
        return ChatResponse(answer=ai_answer.content, recommended_products=[])

    # 1. Search Vector DB for relevant products
    results = search_products(request.message, n_results=3)
    context = "\n".join(results['documents'][0])

    # 2. Ask the LLM to answer using the retrieved context
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    prompt = ChatPromptTemplate.from_template("""
    You are a helpful e-commerce assistant. Use the following product info to answer the user's question.
    If you recommend a product, be specific about why it fits their needs.
    
    Products found in catalog:
    {context}
    
    User Question: {question}
    """)

    chain = prompt | llm
    ai_answer = chain.invoke({"context": context, "question": request.message})

    # 3. Map vector results back to Product objects for the frontend cards
    recommended = [
        Product(id=results['ids'][0][i], **results['metadatas'][0][i])
        for i in range(len(results['ids'][0]))
    ]

    # 4. Return the full response as JSON
    return ChatResponse(answer=ai_answer.content, recommended_products=recommended)


@app.post("/pay")
async def process_payment(request: PaymentRequest):
    # placeholder for payment processing logic
    # in real app, integrate with Stripe/PayPal etc.
    return {"status": "success", "message": "Payment processed", "amount": request.amount}
