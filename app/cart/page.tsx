"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { calculateScheme } from "@/lib/schemes";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Calculate totals using our custom Scheme Engine
  let subtotal = 0;
  let totalDiscount = 0;
  let totalFreeItems = 0;

  const cartWithSchemes = cart.map((item) => {
    const schemeResult = calculateScheme(item.quantity, item.dealerPrice, item.scheme);
    
    subtotal += item.quantity * item.dealerPrice;
    totalDiscount += schemeResult.discountAmount;
    totalFreeItems += schemeResult.freeQty;

    return { ...item, schemeResult };
  });

  const finalTotal = subtotal - totalDiscount;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartWithSchemes.map(item => ({
            skuId: item.skuId,
            quantity: item.quantity,
            dealerPrice: item.dealerPrice,
            freeQty: item.schemeResult.freeQty,
            discountPct: item.schemeResult.discountPct
          })),
          totalAmount: finalTotal,
          source: "MANUAL" // If they came from the AI page, you could pass a prop or use a state flag to set this to "AI_CAPTURE"
        })
      });
      
      if (!res.ok) throw new Error("Failed to place order");

      // Success!
      clearCart();
      alert("Order placed successfully! Check the Order Desk.");
      router.push("/"); // Go back to catalogue
      
    } catch (e) {
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to place an order.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
          Go to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          Add More
        </Link>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {cartWithSchemes.map((item) => (
          <div key={item.skuId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">₹{item.dealerPrice.toFixed(2)} / case</p>
              </div>
              <button onClick={() => removeFromCart(item.skuId)} className="text-red-500 text-sm hover:underline">Remove</button>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => updateQuantity(item.skuId, item.quantity - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-50">-</button>
                <span className="px-4 font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.skuId, item.quantity + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-50">+</button>
              </div>

              {/* Scheme Display */}
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{(item.quantity * item.dealerPrice - item.schemeResult.discountAmount).toFixed(2)}</p>
                {item.schemeResult.freeQty > 0 && (
                  <p className="text-xs font-bold text-green-600 mt-1">
                    + {item.schemeResult.freeQty} FREE
                  </p>
                )}
                {item.schemeResult.discountPct > 0 && (
                  <p className="text-xs font-bold text-amber-600 mt-1">
                    {item.schemeResult.discountPct}% OFF applied
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm mb-1 text-green-600">
              <span>Scheme Discount</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 mb-4">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
          >
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}