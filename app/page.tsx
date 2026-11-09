import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CartFloatingBar } from "@/components/CartFloatingBar";
import { CatalogueGrid } from "@/components/CatalogueGrid";

export default async function CataloguePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role === "ORDER_DESK") redirect("/desk");

  const skus = await prisma.sKU.findMany({ include: { schemes: true } });

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      
      {/* Full-Width Sticky Header - Extreme Left Aligned */}
      <header className="bg-white/95 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 md:px-8 py-3 flex justify-between items-center">
          
          {/* Left Side: Logo & Store Name */}
          <div className="flex items-center gap-3">
            {/* CSS LOGO - GUARANTEED TO WORK ON VERCEL */}
                        <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-12 h-12 object-contain drop-shadow-sm" 
            />
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Catalogue</h1>
              <p className="text-xs font-semibold text-slate-500">Gupta Kirana Store</p>
            </div>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link href="/ai-order" className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all flex items-center shadow-sm">
               AI Capture
            </Link>
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer border-2 border-white ring-2 ring-slate-100">
              RG
            </div>
          </div>

        </div>
      </header>

      {/* Interactive Client Component */}
      <CatalogueGrid initialSkus={skus} />
      
      <CartFloatingBar />
    </div>
  );
}