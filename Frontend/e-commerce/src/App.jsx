import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  ShoppingCart,
  Trash2,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- PRODUCT CARD COMPONENT (Used in Chat) ---
const ProductCard = ({ product, onAdd }) => (
  <div className="mt-2 bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition text-gray-800">
    <div className="aspect-square bg-slate-100 overflow-hidden relative flex items-center justify-center">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name || "Product"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Prevent infinite error loop by removing the src and showing fallback
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.parentNode.innerHTML =
              "<div style=\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f1f5f9\"><svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#94a3b8' stroke-width='1.5'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg></div>";
          }}
        />
      ) : (
        <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">
          No Image
        </span>
      )}
    </div>
    <div className="p-3">
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {product.category}
        </span>
        <span className="font-bold text-sm">
          ₦{Number(product.price).toLocaleString()}
        </span>
      </div>
      <h3 className="font-semibold text-xs mb-2">{product.name}</h3>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Add to cart clicked for:", product);
          onAdd(product);
        }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-1.5 rounded-lg text-xs hover:from-purple-700 hover:to-blue-700 transition font-semibold cursor-pointer"
      >
        <ShoppingCart size={14} /> Add to Cart
      </button>
    </div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your assistant. How can I help you find something today?",
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addToCart = (product) => {
    console.log("Adding to cart:", product);
    setCart((prev) => [...prev, product]);
  };
  const removeFromCart = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePayment = async () => {
    // call backend to process payment
    try {
      const response = await fetch("http://localhost:8000/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal, items: cart }),
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Payment successful!");
        setCart([]);
      } else {
        alert("Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setIsPaymentOpen(false);
    }
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch("http://localhost:8000/products");
        if (!response.ok) throw new Error("Server down");
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts =
    selectedCategory === "All Products"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const currentInput = userInput;
    setMessages((prev) => [...prev, { role: "user", content: currentInput }]);
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col font-sans text-gray-900 relative">
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 border-b sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-white hover:text-purple-200 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-black text-white italic">ShopperAI</h1>
        </div>
        <div
          className="relative cursor-pointer group"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart
            className="text-white group-hover:text-yellow-300 transition"
            size={28}
          />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg">
              {cart.length}
            </span>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="font-bold text-purple-600 uppercase text-xs tracking-widest mb-4">
                Categories
              </h3>
              <ul className="space-y-2">
                {[
                  "All Products",
                  "Electronics",
                  "Footwear",
                  "Accessories",
                  "Apparel",
                  "Fitness",
                  "Home",
                ].map((cat) => (
                  <li
                    key={cat}
                    className={`p-3 rounded-lg cursor-pointer transition ${selectedCategory === cat ? "bg-purple-100 text-purple-800 font-bold" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 bg-white border-r p-6 h-[calc(100vh-73px)] sticky top-[73px] shadow-lg">
          <h3 className="font-bold text-purple-600 uppercase text-xs tracking-widest mb-4">
            Categories
          </h3>
          <ul className="space-y-2">
            {[
              "All Products",
              "Electronics",
              "Footwear",
              "Accessories",
              "Apparel",
              "Fitness",
              "Home",
            ].map((cat) => (
              <li
                key={cat}
                className={`p-3 rounded-lg cursor-pointer transition ${selectedCategory === cat ? "bg-purple-100 text-purple-800 font-bold" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 md:p-12 mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                Welcome to ShopperAI
              </h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Discover amazing products tailored just for you with the power
                of AI. Chat with our assistant to find exactly what you need!
              </p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Start Chatting
              </button>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
              Featured Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 group overflow-hidden"
                >
                  {/* --- FIXED IMAGE SECTION --- */}
                  <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300?text=Image+Not+Found";
                        }}
                      />
                    ) : (
                      <span className="text-purple-300 font-bold uppercase tracking-widest text-xs">
                        No Image
                      </span>
                    )}
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.category}
                    </div>
                  </div>
                  {/* --------------------------- */}

                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-black text-purple-700">
                      ₦{Number(product.price).toLocaleString()}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg active:scale-95 hover:shadow-xl"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Your Cart</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-purple-400 text-xs">Img</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <p className="text-purple-600 font-bold">
                            ₦{Number(item.price).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 hover:text-red-700 transition p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-800">
                      Total:
                    </span>
                    <span className="text-2xl font-black text-purple-700">
                      ₦{Number(cartTotal).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4"
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md h-[80vh] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-lg font-bold">AI Shopping Assistant</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-2xl ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.products.map((prod, i) => (
                            <ProductCard
                              key={i}
                              product={prod}
                              onAdd={addToCart}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask me about products..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsPaymentOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
              <p className="mb-4">
                Total amount:{" "}
                <span className="font-bold">
                  ₦{Number(cartTotal).toLocaleString()}
                </span>
              </p>
              {/* Placeholder form fields */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Card number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-24 border border-gray-300 rounded-xl px-4 py-2"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Name on card"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                >
                  Pay Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
