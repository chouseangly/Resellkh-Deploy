'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyForgotPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing from the URL.");
      router.push("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`);
        if (prev) prev.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(paste)) {
      setOtp(paste.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auths/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const text = await res.text();

      if (!res.ok) throw new Error(text || "Verification failed");

      toast.success(text, { position: "bottom-right" });

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    try {
      setIsResending(true);

      const res = await fetch(`${API_BASE_URL}/auths/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to resend OTP.");

      toast.success("OTP resent successfully!", { position: "bottom-right" });
      setTimer(60);
    } catch (err) {
      toast.error(err.message || "Error resending OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-[210px] py-12 gap-10">
      {/* Left Image */}
      <div className="hidden md:flex lg:w-1/2 justify-center">
        <img
          src="/images/auth/verify OTP.jpg"
          alt="OTP Illustration"
          className="w-full max-w-[400px] h-auto"
        />
      </div>

      {/* OTP Form */}
      <div className="w-full lg:w-1/2 max-w-md text-center space-y-6">
        <h2 className="text-2xl font-bold">OTP Verification</h2>
        <p className="text-gray-600 text-sm">
          Enter the OTP sent to{" "}
          <span className="text-orange-500 font-medium break-words">{email}</span>
        </p>

        <div className="flex justify-center gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={idx === 0 ? handlePaste : undefined}
              className="w-12 h-12 border-b-2 text-center text-xl outline-none focus:border-orange-500 transition"
            />
          ))}
        </div>

        <p className="text-orange-500 text-sm font-medium">
          {timer > 0 ? `00:${String(timer).padStart(2, "0")}` : "Expired"}
        </p>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-sm text-gray-600">
          Didn’t receive the OTP?
          <button
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className="font-semibold text-orange-500 hover:underline disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </p>
      </div>
    </div>
  );
}
