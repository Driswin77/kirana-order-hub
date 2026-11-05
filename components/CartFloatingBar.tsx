"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartFloatingBar() {
  const { cart } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.dealerPrice, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Link href="/cart" className="bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex justify-between items-center hover:bg-slate-800 transition-all group">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            {totalItems}
          </div>
          <p className="text-sm font-semibold tracking-wide group-hover:translate-x-1 transition-transform">View Cart</p>
        </div>
        <p className="font-bold text-lg">₹{totalAmount.toFixed(2)}</p>
      </Link>
    </div>
  );
}