import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartFloatingBar } from "@/components/CartFloatingBar";

export default async function CataloguePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role === "ORDER_DESK") redirect("/desk");

  const skus = await prisma.sKU.findMany({ include: { schemes: true } });

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60 px-4 py-4 flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Catalogue</h1>
          <p className="text-xs font-medium text-slate-500">Gupta Kirana Store</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ai-order" className="text-sm font-semibold text-indigo-600 bg-indigo-50/80 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all flex items-center gap-1 shadow-sm">
            <span>✨</span> AI Order
          </Link>
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer">
            RG
          </div>
        </div>
      </header>

      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mt-4">
        {skus.map((sku) => {
          const scheme = sku.schemes[0];
          const isOutOfStock = sku.stockCases === 0;
          const isLowStock = sku.stockCases > 0 && sku.stockCases < 100;

          return (
            <div 
              key={sku.id} 
              className={`group bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${isOutOfStock ? 'opacity-60 grayscale-[50%]' : ''}`}
            >
              <div>
                {/* Visual Placeholder for Image */}
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                  <span className="text-4xl opacity-20 group-hover:scale-110 transition-transform duration-300">
                    {sku.code.includes("BS") ? "🍪" : sku.code.includes("DT") ? "🧺" : "🍵"}
                  </span>
                  {scheme && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                      {scheme.type === 'BUY_X_GET_Y' 
                        ? `Buy ${scheme.buyQty} Get ${scheme.freeQty}` 
                        : `${scheme.discountPct}% OFF`}
                    </span>
                  )}
                </div>
                
                <h2 className="text-base font-bold text-slate-900 leading-tight mb-1">
                  {sku.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mb-4">{sku.code}</p>
              </div>

              <div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">₹{sku.dealerPrice.toFixed(2)}</p>
                    <p className="text-[11px] font-medium text-slate-500">per case (GST incl.)</p>
                  </div>
                  <div>
                    {isOutOfStock ? (
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">{sku.stockCases} left</span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">In Stock</span>
                    )}
                  </div>
                </div>

                {isOutOfStock ? (
                  <button disabled className="w-full bg-slate-100 text-slate-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
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
      <CartFloatingBar />
    </div>
  );
}