"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";

export function CatalogueGrid({ initialSkus }: { initialSkus: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products based on search text (matches name or SKU code)
  const filteredSkus = initialSkus.filter((sku) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sku.name.toLowerCase().includes(searchLower) ||
      sku.code.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {/* Search & Quick Stats bar */}
      <div className="bg-white border-b border-slate-200/60 sticky top-[69px] z-20 shadow-sm">
        <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..." 
              className="w-full bg-slate-100 border-transparent rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium text-slate-700"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ₹50k Credit
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full max-w-[1600px] mx-auto mt-2">
        {filteredSkus.map((sku) => {
          const scheme = sku.schemes?.[0];
          const isOutOfStock = sku.stockCases === 0;
          const isLowStock = sku.stockCases > 0 && sku.stockCases < 100;

          return (
            <div 
              key={sku.id} 
              className={`group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''}`}
            >
              <div>
                {/* Image Placeholder & Badges */}
                <div className="w-full aspect-[4/3] bg-slate-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                  <span className="text-6xl opacity-30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                    {sku.code.includes("BS") ? "🍪" : sku.code.includes("DT") ? "🧺" : "🍵"}
                  </span>
                  
                  {scheme && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                      {scheme.type === 'BUY_X_GET_Y' 
                        ? `Buy ${scheme.buyQty} Get ${scheme.freeQty}` 
                        : `${scheme.discountPct}% OFF`}
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100/90 backdrop-blur-sm px-2 py-1 rounded-lg">Out</span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded-lg">{sku.stockCases} left</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 backdrop-blur-sm px-2 py-1 rounded-lg">In Stock</span>
                    )}
                  </div>
                </div>
                
                <h2 className="text-base font-bold text-slate-900 leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {sku.name}
                </h2>
                <p className="text-[11px] font-mono text-slate-400 mb-4">{sku.code}</p>
              </div>

              <div>
                <div className="flex flex-col mb-4">
                  <p className="text-2xl font-extrabold text-slate-900">₹{sku.dealerPrice.toFixed(2)}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">per case (GST incl.)</p>
                </div>

                {isOutOfStock ? (
                  <button disabled className="w-full bg-slate-100 text-slate-400 text-sm font-bold py-3 rounded-xl cursor-not-allowed">
                    Unavailable
                  </button>
                ) : (
                  <AddToCartButton 
                    product={{
                      skuId: sku.id, code: sku.code, name: sku.name,
                      dealerPrice: sku.dealerPrice, stockCases: sku.stockCases,
                      scheme: scheme, quantity: 1
                    }} 
                  />
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Empty State if search yields no results */}
      {filteredSkus.length === 0 && (
        <div className="w-full text-center py-20">
          <div className="text-5xl mb-4 opacity-50">🔍</div>
          <h3 className="text-xl font-bold text-slate-900">No products found</h3>
          <p className="text-slate-500 mt-1">Try searching for a different keyword or SKU code.</p>
        </div>
      )}
    </>
  );
}