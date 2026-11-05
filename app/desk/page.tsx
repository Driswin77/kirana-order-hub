import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrderDeskPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ORDER_DESK") redirect("/login");

  const orders = await prisma.order.findMany({
    include: { retailer: true, items: { include: { sku: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Desk</h1>
            <p className="text-slate-500 text-sm mt-1">Manage incoming AI and manual orders</p>
          </div>
          <a 
            href="/api/export" 
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
          >
            <span>📥</span> Export to Tally (CSV)
          </a>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Order Details</th>
                <th className="p-4">Retailer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{order.createdAt.toLocaleDateString()}</p>
                    {order.source === "AI_CAPTURE" && (
                      <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">✨ AI</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{order.retailer.shopName}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    <p className="font-medium">{order.items.length} items</p>
                    <p className="text-[11px] text-slate-400 truncate w-32">{order.items.map(i => i.sku.name.split(',')[0]).join(", ")}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-900">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      order.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">Confirm</button>
                        <button className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors border border-red-100">Hold</button>
                      </div>
                    ) : (
                       <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <p className="text-lg font-medium mb-1">No orders yet</p>
                    <p className="text-sm">Orders placed by retailers will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}