import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderActions } from "@/components/OrderActions";

export default async function OrderDeskPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ORDER_DESK") redirect("/login");

  const orders = await prisma.order.findMany({
    include: { retailer: true, items: { include: { sku: true } } },
    orderBy: { createdAt: "desc" }
  });

  // Calculate Stats for the Dashboard Cards
  const totalRevenue = orders.filter(o => o.status === 'CONFIRMED').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Order Desk
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider ml-2">Live</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage incoming AI and manual orders</p>
          </div>
          <a 
            href="/api/export" 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center gap-2"
          >
            <span>📥</span> Export to Tally (CSV)
          </a>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">📦</span>
            </div>
            <span className="text-sm font-bold text-slate-500 mb-1 block">Total Orders</span>
            <span className="text-4xl font-extrabold text-slate-900">{totalOrders}</span>
          </div>

          {/* Pending Approval */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">⏳</span>
            </div>
            <span className="text-sm font-bold text-amber-600 mb-1 block">Pending Approval</span>
            <span className="text-4xl font-extrabold text-slate-900">{pendingCount}</span>
          </div>

          {/* Confirmed Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">💰</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 mb-1 block">Confirmed Revenue</span>
            <span className="text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Showing latest {orders.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Order Details</th>
                  <th className="p-4">Retailer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors text-sm group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900">#{order.id.slice(-6).toUpperCase()}</p>
                        {order.source === "AI_CAPTURE" && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wide">
                            ✨ AI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">{order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {order.retailer.shopName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{order.retailer.shopName}</p>
                          <p className="text-[10px] font-medium text-slate-500">Retailer</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{order.items.length} items</p>
                      <p className="text-[11px] font-medium text-slate-400 truncate w-40 mt-0.5">
                        {order.items.map(i => i.sku.name.split(',')[0]).join(", ")}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-slate-900 text-base">₹{order.totalAmount.toFixed(2)}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {order.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {order.status === 'CONFIRMED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {order.status === "PENDING" ? (
                        <OrderActions orderId={order.id} />
                      ) : (
                         <span className="text-xs font-medium text-slate-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-500">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-lg font-bold text-slate-900 mb-1">No orders yet</p>
                      <p className="text-sm font-medium">Orders placed by retailers will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}