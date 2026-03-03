import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="font-bold text-lg text-gray-900">${product.price}</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition">
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;