from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.services.vector_service import search_products
import json
from fastapi import FastAPI
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.models.schemas import Product, ChatRequest, ChatResponse
from dotenv import load_dotenv
import os
from fastapi.responses import StreamingResponse
import asyncio

load_dotenv()

app = FastAPI()

# --- CORS SECTION ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

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
    with open("data/products.json", "r") as f:
        return json.load(f)


@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
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
