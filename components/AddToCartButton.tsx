"use client";

import { useCart, CartItem } from "@/lib/cart-context";

export function AddToCartButton({ product }: { product: CartItem }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart({ ...product, quantity: 1 })}
      className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm"
    >
      Add to Cart
    </button>
  );
}