'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyOTPClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
        const next = document.getElementById(`otp-${index + 1}`);
        if (next) next.focus();
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
      const lastInput = document.getElementById(`otp-5`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auths/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) throw new Error(data.message || "Verification failed");

      toast.success(`Verified successfully`, { position: "bottom-right" });
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) {
      toast.error("Please wait for the timer to expire before resending.");
      return;
    }
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

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to resend OTP");
      }

      const data = await res.json();
      toast.success(data.message || `OTP sent to ${email}`);
      setTimer(60); // Reset timer on successful resend
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-[170px] py-10 gap-10">
      {/* Left Illustration */}
      <div className="hidden md:flex lg:w-1/2 justify-between">
        <img
          src="/images/auth/verify OTP.jpg"
          alt="OTP Illustration"
          className="w-full max-w-[400px] h-auto"
        />
      </div>

      {/* OTP Form */}
      <div className="w-full lg:w-1/2 max-w-md text-center space-y-6">
        <div className="mx-auto flex items-center justify-center">
          {/* Icon SVG */}
          <svg width="71" height="70" viewBox="0 0 71 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35.6699 0.833344C32.1699 0.833344 28.9866 2.39168 26.6983 4.9L20.4866 11.8417C20.0483 12.3383 19.9866 13.055 20.3483 13.61L22.1283 16.595C22.4899 17.1517 23.1483 17.425 23.7733 17.275L30.1483 15.6333C30.655 15.5158 31.0983 15.1433 31.3483 14.6592L33.2483 10.99C33.5816 10.365 34.5016 9.80834 35.4516 9.80834H48.4283C50.1866 9.80834 51.6283 11.25 51.6283 13.0083V20.125C51.6283 20.8 51.1516 21.3917 50.4866 21.3917H43.9516C42.8483 21.3917 41.8866 22.1083 41.6866 23.2025L40.6866 28.8458C40.4866 29.94 41.2033 30.9017 42.2983 31.1017L48.8333 32.4083C49.1233 32.4667 49.4124 32.5542 49.6866 32.6658L59.0333 36.8083C64.0483 39.0683 67.3199 44.42 67.3199 50.1667C67.3199 59.5417 59.4866 67.375 50.1116 67.375C40.7366 67.375 32.9033 59.5417 32.9033 50.1667C32.9033 46.4583 34.0983 43.0417 36.1699 40.25L41.3116 33.1917C41.7499 32.5958 41.6583 31.82 41.0916 31.4017L38.4866 29.4725C37.9199 29.0542 37.0583 29.1717 36.6483 29.74L28.2116 41.2417C24.5316 46.5017 28.1283 53.6667 34.4516 53.6667C37.9816 53.6667 40.8733 50.775 40.8733 47.245C40.8733 46.0383 41.835 45.0767 43.0416 45.0767C44.2483 45.0767 45.2099 46.0383 45.2099 47.245C45.2099 53.1917 40.1366 58.0833 34.4516 58.0833C26.1583 58.0833 22.4499 47.805 27.5233 40.6683L35.9599 29.1683C36.3116 28.6717 36.9416 28.425 37.595 28.575L40.1416 29.1683L35.0283 36.2275C34.5016 36.9158 34.7733 37.9058 35.5199 38.3525L37.1033 39.255C37.2533 39.3425 37.4283 39.3717 37.595 39.3717C37.9566 39.3717 38.3183 39.225 38.5683 38.9167L46.6866 28.4875C46.965 28.125 46.9941 27.6725 46.7758 27.31L43.9283 22.6917L44.8316 22.42C45.9266 22.0967 46.615 21.0783 46.615 19.925V13.0083C46.615 13.96 47.4199 14.765 48.4283 14.765H49.5783C49.8966 14.765 50.1866 14.94 50.3366 15.2133L53.7733 21.3917C54.2116 22.1967 53.655 23.2308 52.7933 23.2308H49.6583C48.555 23.2308 47.5933 23.9475 47.3933 25.0417L46.3933 30.685C45.9366 33.1517 43.6183 34.805 41.1333 34.3483L34.5983 33.0417C34.3083 32.9833 34.0191 32.8958 33.7449 32.7842L24.3983 28.6417C19.3833 26.3817 16.1116 21.0333 16.1116 15.2867C16.1116 5.91168 23.9449 -1.92166 33.3199 -1.92166C42.6949 -1.92166 50.5283 5.91168 50.5283 15.2867C50.5283 18.995 49.3333 22.4117 47.2616 25.1917L42.1199 32.2508C41.6816 32.8475 41.7733 33.6217 42.3399 34.04L44.9449 35.9692C45.5116 36.3875 46.3733 36.27 46.7833 35.7L55.2199 24.2C58.8999 18.94 55.3033 11.775 48.9799 11.775C45.4499 11.775 42.5583 14.6667 42.5583 18.1967C42.5583 19.4033 41.5966 20.365 40.3899 20.365C39.1833 20.365 38.2216 19.4033 38.2216 18.1967C38.2216 12.25 43.2949 7.35834 48.9799 7.35834H35.4516C34.7866 7.35834 34.1949 7.78834 33.9166 8.37334L32.0166 12.0417C31.7949 12.46 31.3233 12.7333 30.8166 12.8217L24.4416 14.4642C24.1333 14.5225 23.8533 14.435 23.6616 14.2433L21.8816 11.2583C21.7499 11.0367 21.7783 10.7633 21.9366 10.5708L28.1483 3.62918C30.6783 1.55751 33.1633 0.833344 35.6699 0.833344Z" fill="#F97316"/>
            <path d="M19.3366 41.385C19.0466 41.1567 18.6566 41.1275 18.3383 41.3275L3.80995 51.015C-3.86172 55.4817 -0.548384 66.5283 8.36828 66.5283C15.4433 66.5283 21.2933 60.6783 21.2933 53.6033C21.2933 53.0467 20.8466 52.6000 20.2900 52.6000C19.7333 52.6000 19.2866 53.0467 19.2866 53.6033C19.2866 59.5492 14.3950 64.5233 8.36828 64.5233C1.34828 64.5233 -1.16505 56.405 5.07495 52.5567L19.6033 42.8692C19.9216 42.6692 20.0091 42.2792 19.8091 41.9608C19.6674 41.7008 19.3383 41.5542 19.0200 41.5542C18.9916 41.5542 18.9633 41.5542 18.9350 41.5825L6.04828 49.3783C5.55162 49.73 4.83495 49.4883 4.54495 48.9617L3.64162 47.4367C3.35162 46.9100 3.59328 46.1933 4.11995 45.9033L17.0066 38.1075C17.0650 38.0783 17.1233 38.0492 17.1816 38.0200L17.5150 37.8442C17.6566 37.7858 17.8233 37.7858 17.9650 37.8442L19.8933 38.8083C20.5183 39.1317 20.7316 39.8775 20.3500 40.4625L19.3366 41.385Z" fill="#F97316"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold">OTP Verification</h2>
        <p className="text-gray-600 text-sm">
          Enter the OTP sent to{" "}
          <span className="text-orange-500 font-medium break-words">{email || "your email"}</span>
        </p>

        {/* OTP Inputs */}
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
          Didn’t receive the OTP?{" "}
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
