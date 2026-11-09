"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex justify-end gap-2">
      <button 
        onClick={() => updateStatus("CONFIRMED")}
        disabled={loading}
        className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        Confirm
      </button>
      <button 
        onClick={() => updateStatus("ON_HOLD")}
        disabled={loading}
        className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50"
      >
        Hold
      </button>
    </div>
  );
}