"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react"; // Added getSession
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
      // THE FIX: Check the role before routing
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Kirana Order Hub</h1>
          <p className="text-gray-500 text-sm mt-2">
            {step === 1 ? "Enter your phone number to login" : "Enter the 6-digit OTP"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 border focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Send OTP
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Demo Retailer: 9876543210 <br /> Demo Desk: 9999999999
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP (Mock: 123456)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full rounded-md border-gray-300 px-3 py-3 border focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest text-gray-900"
                placeholder="••••••"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}