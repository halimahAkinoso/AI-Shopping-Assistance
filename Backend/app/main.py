import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import Product, ChatRequest, ChatResponse
from app.services.vector_service import search_products # Custom logic from Phase 2
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

app = FastAPI()

# Enable CORS so React (port 5173) can talk to FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. GET /products: Load the raw catalog for the UI
@app.get("/products", response_model=List[Product])
async def get_products():
    with open("data/products.json", "r") as f:
        return json.load(f)

# 2. POST /chat: The AI Brain
@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    # Step A: Search Vector DB for relevant products
    # search_products returns documents based on semantic similarity
    results = search_products(request.message, n_results=3)
    
    context = "\n".join(results['documents'][0])
    
    # Step B: Ask the LLM to answer using the retrieved context
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

    # Step C: Return AI text + the actual product metadata for the frontend cards
    # Map vector results back to Product objects
    recommended = [
        Product(id=results['ids'][0][i], **results['metadatas'][0][i]) 
        for i in range(len(results['ids'][0]))
    ]
    
    return ChatResponse(answer=ai_answer.content, recommended_products=recommended)