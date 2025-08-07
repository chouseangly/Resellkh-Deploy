// app/(auth)/reset-password/ResetPasswordClient.jsx
'use client'; // ✅ This must be first

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { toast, Toaster } from "react-hot-toast";
import Input from "@/components/ui/Input";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email. Redirecting to forgot password.");
      router.push("/forgot-password");
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Missing email.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auths/reset-new-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          newPassword: password,
          confirmPassword: confirm
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      toast.success("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white px-[150px]">
        {/* Left Image */}
        <div className="hidden md:flex w-1/2 justify-between">
          <Image
            src="/images/auth/create new password.jpg"
            alt="Reset Password"
            className="w-[400px]"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 max-w-md space-y-6">
          <div className="flex justify-center mb-8">
            <Image src="/images/auth/logo.jpg" alt="logo" className="w-[130px]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-left">Create new Password</h2>
            <p className="text-gray-500 mt-2 text-left text-sm">
              Set the new password for your account so you can login and access all features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reset Password Field */}
            <div className="relative">
              <Input
                label="Reset Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[46px] transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
              >
                {showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
              </span>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-[46px] transform -translate-y-1/2 cursor-pointer text-gray-500 text-xl"
              >
                {showConfirm ? <HiOutlineEye /> : <HiOutlineEyeOff />}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

