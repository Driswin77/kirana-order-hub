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
  const [showSuccess, setShowSuccess] = useState(false); // NEW: Success Modal state

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
  
  const creditLimit = 50000;
  const creditUsed = finalTotal;
  const creditAvailable = creditLimit - creditUsed;
  const creditPercentage = Math.min((creditUsed / creditLimit) * 100, 100);

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
          source: "MANUAL" 
        })
      });
      
      if (!res.ok) throw new Error("Failed to place order");

      // Success! Clear cart and show custom modal instead of alert
      clearCart();
      setShowSuccess(true);
      
    } catch (e) {
      setError("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // If cart is empty AND we aren't showing the success modal
  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-24 h-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl opacity-50">🛒</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-8 text-center max-w-xs">Looks like you haven't added any products to your order yet.</p>
        <Link href="/" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-40 font-sans relative">
      
      {/* Full-width Sticky Header */}
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Cart</h1>
          <Link href="/" className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors">
            + Add More
          </Link>
        </div>
      </header>

      <main className="p-5 max-w-3xl mx-auto space-y-5 mt-2">
        
        {/* Credit Limit Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Credit</p>
              <p className="text-2xl font-extrabold text-slate-900">₹{creditAvailable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <p className="text-xs font-semibold text-slate-400">Limit: ₹{creditLimit.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${creditPercentage > 90 ? 'bg-red-500' : creditPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${creditPercentage}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4">
          {cartWithSchemes.map((item) => (
            <div key={item.skuId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1">{item.name}</h3>
                  <p className="text-sm font-semibold text-slate-500">₹{item.dealerPrice.toFixed(2)} / case</p>
                </div>
                <button onClick={() => removeFromCart(item.skuId)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  Remove
                </button>
              </div>

              <div className="flex items-end justify-between">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button onClick={() => updateQuantity(item.skuId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 active:scale-95 transition-all font-bold">
                    -
                  </button>
                  <span className="w-12 text-center font-extrabold text-slate-900 text-base">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.skuId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 active:scale-95 transition-all font-bold">
                    +
                  </button>
                </div>

                {/* Scheme Display */}
                <div className="text-right">
                  <p className="font-extrabold text-slate-900 text-lg">₹{(item.quantity * item.dealerPrice - item.schemeResult.discountAmount).toFixed(2)}</p>
                  
                  {item.schemeResult.freeQty > 0 && (
                    <div className="mt-1 flex justify-end">
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wide flex items-center gap-1">
                        🎁 + {item.schemeResult.freeQty} FREE
                      </span>
                    </div>
                  )}
                  {item.schemeResult.discountPct > 0 && (
                    <div className="mt-1 flex justify-end">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                        🏷️ {item.schemeResult.discountPct}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Premium Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-sm font-semibold text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-700">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm font-bold text-emerald-600">
                <span>Scheme Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-end pt-2 border-t border-slate-100">
              <span className="text-lg font-extrabold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-extrabold text-base hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {placing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Placing Order...
              </>
            ) : (
              <>Place Order →</>
            )}
          </button>
        </div>
      </div>

            {/* CUSTOM SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Order Placed!</h2>
            <p className="text-slate-500 mb-8 font-medium">Your order has been successfully sent to the Order Desk for review.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                router.push("/");
              }}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Back to Catalogue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}