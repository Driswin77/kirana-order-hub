"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      phone,
      otp,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      const session = await getSession();
      if ((session?.user as any)?.role === "ORDER_DESK") {
        router.push("/desk");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      
      {/* Soft, light-mode background glows (Emerald & Sky) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-100 rounded-full blur-[120px] opacity-60"></div>
      
      {/* Clean White Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* CSS LOGO - GUARANTEED TO WORK ON VERCEL */}
          <div className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl shadow-lg border border-slate-600 mb-4">
            K
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to Kirana Hub</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {step === 1 ? "Enter your registered phone number" : "Enter the 6-digit OTP sent to you"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="flex bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-900 transition-all shadow-sm">
                <span className="inline-flex items-center px-4 border-r border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 w-full bg-transparent px-4 py-3.5 text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                  placeholder="98765 43210"
                  maxLength={10}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              Send OTP
            </button>
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] font-mono text-slate-500">
                <span className="text-slate-400">Demo Retailer:</span> 9876543210 <br />
                <span className="text-slate-400">Demo Desk:</span> 9999999999
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">OTP (Mock: 123456)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                placeholder="••••••"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors mt-2"
            >
              ← Back to Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}