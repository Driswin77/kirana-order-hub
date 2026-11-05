"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

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
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Order Capture</h1>
        <p className="text-gray-500 text-sm">Paste your WhatsApp message or type your order below.</p>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti"
          className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
        />
        <button
          onClick={handleParse}
          disabled={loading || !text}
          className="mt-3 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? "Parsing with AI..." : "Parse Order"}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

      {results && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Review Parsed Items</h2>
          
          {results.lines.map((line: any, idx: number) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  "{line.rawText}"
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${line.confidence > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {line.confidence}% Match
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="font-semibold text-gray-900">{line.skuCode}</p>
                  <p className="text-sm text-gray-500">Qty: {line.quantity} cases</p>
                </div>
              </div>

              {line.confidence < 80 && line.alternatives?.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Did you mean?</p>
                  <div className="flex gap-2">
                    {line.alternatives.map((alt: any, i: number) => (
                      <button key={i} className="text-xs bg-white border border-amber-200 px-2 py-1 rounded text-amber-700">
                        {alt.skuCode} ({alt.confidence}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {results.unclearUnits?.length > 0 && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="text-sm font-bold text-red-800 mb-1">Action Required</h3>
              {results.unclearUnits.map((u: any, idx: number) => (
                <p key={idx} className="text-sm text-red-600">"{u.rawText}": {u.reason}</p>
              ))}
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 mt-4"
          >
            Confirm & Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}