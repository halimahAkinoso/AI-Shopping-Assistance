import React from "react";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ product, onAdd }) => {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full group">
      {/* --- IMAGE SECTION --- */}
      <div className="aspect-square bg-slate-100 overflow-hidden relative flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback if the image file (like p1.jpg) is missing
              e.target.src =
                "https://via.placeholder.com/300?text=No+Image+Found";
            }}
          />
        ) : (
          <span className="text-slate-300 font-bold uppercase tracking-widest text-xs">
            No Image
          </span>
        )}
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="font-bold text-lg text-gray-900">
            ₦{product.price}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <button
          onClick={() => onAdd(product)} // Triggers the cart function in App.jsx
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md active:scale-95"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
