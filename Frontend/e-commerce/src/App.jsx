import React, { useState } from "react";
import { MessageCircle, X, Send, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import { motion, AnimatePresence } from "framer-motion";

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ product }) => (
  <div className="mt-2 bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition text-gray-800">
    <div className="p-3">
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {product.category}
        </span>
        <span className="font-bold text-sm">${product.price}</span>
      </div>
      <h3 className="font-semibold text-xs mb-1">{product.name}</h3>
      <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
        {product.description}
      </p>
      <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-1.5 rounded-lg text-xs hover:bg-gray-800 transition">
        <ShoppingCart size={14} />
        Add to Cart
      </button>
    </div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your assistant. How can I help you find something today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          products: data.recommended_products,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Is the backend running?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="hidden md:flex w-64 bg-white border-r flex-col p-6 h-screen sticky top-0">
        <h1 className="font-bold text-2xl text-blue-600 mb-8 tracking-tight">
          ShopperAI
        </h1>
        <nav className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-700 font-medium cursor-pointer">
            Home
          </div>
          <div className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer">
            Categories
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-10 flex items-center justify-center">
        <div className="max-w-xl text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Find your perfect match.
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Personalized recommendations powered by AI.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5"
          >
            Start Chatting
          </button>
        </div>
      </main>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition active:scale-95"
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      <AnimatePresence>
        {isChatOpen && (
          /* FIXED: Used motion.div here */
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 md:w-96 h-[550px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50"
          >
            <div className="bg-blue-600 p-4 text-white font-bold shadow-md">
              AI Shopping Assistant
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none"}`}
                  >
                    {msg.content}

                    {/* Render Product Cards if the AI recommended anything */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {msg.products.map((p, i) => (
                          <ProductCard key={i} product={p} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-xs text-blue-500 font-medium animate-pulse ml-2">
                  Assistant is typing...
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about shoes, tech..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-blue-600 text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-blue-700 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
