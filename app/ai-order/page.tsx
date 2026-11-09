"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function AIOrderPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleParse = async () => {
    if (!text) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/ai-parse", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (err: any) {
      setError("Failed to parse. Please try again or add items manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!results?.lines) return;

    results.lines.forEach((line: any) => {
      if (line.sku) {
        addToCart({
          skuId: line.sku.id,
          code: line.sku.code,
          name: line.sku.name,
          dealerPrice: line.sku.dealerPrice,
          stockCases: line.sku.stockCases,
          scheme: line.sku.schemes?.[0] || null,
          quantity: line.quantity,
        });
      }
    });

    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              AI Order Capture <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Beta</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="p-5 max-w-3xl mx-auto mt-2">
        
        {/* Input Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Paste WhatsApp Message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 resize-none font-medium placeholder-slate-400 transition-all text-sm"
          />
          
          <button
            onClick={handleParse}
            disabled={loading || !text}
            className="mt-4 w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing with AI...
              </>
            ) : (
              <>
                 Parse Order
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center border border-red-100 mb-6">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="font-bold text-slate-900 text-lg">Review Items</h2>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {results.lines.length} items detected
              </span>
            </div>
            
            {results.lines.map((line: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
                    "{line.rawText}"
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide ${line.confidence > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {line.confidence}% Match
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{line.sku?.name || line.skuCode}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Quantity: <span className="text-slate-900 font-bold">{line.quantity} cases</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">₹{((line.sku?.dealerPrice || 0) * line.quantity).toFixed(2)}</p>
                  </div>
                </div>

                {line.confidence < 80 && line.alternatives?.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                      <span>⚠️</span> Did you mean?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {line.alternatives.map((alt: any, i: number) => (
                        <button key={i} className="text-xs font-semibold bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors">
                          {alt.skuCode} ({alt.confidence}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {results.unclearUnits?.length > 0 && (
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
                <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                  <span>🚨</span> Action Required
                </h3>
                {results.unclearUnits.map((u: any, idx: number) => (
                  <p key={idx} className="text-sm font-medium text-red-600 mb-1">
                    "{u.rawText}": {u.reason}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-indigo-700 mt-6 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex justify-center items-center gap-2"
            >
              Confirm & Add to Cart <span>→</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}