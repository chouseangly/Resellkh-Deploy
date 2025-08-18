"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import Image from "next/image";
import Input from "@/components/ui/Input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleBlur = (e) => {
    // Basic validation on blur can be added here if needed
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "Please enter your first name";
    if (!form.lastName.trim()) newErrors.lastName = "Please enter your last name";
    if (!form.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      newErrors.password = "Please enter your password";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show a general error toast if form is invalid
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auths/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success("Registration successful! Please check your email to verify.");
        window.dispatchEvent(new Event("storage"));
        router.push(`/verifyOTP?email=${form.email}`);
      } else {
        // Use the message from the backend, or a default one
        toast.error(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      console.log("Storing Google session data to localStorage", session);
      localStorage.setItem("token", session.accessToken);
      localStorage.setItem("userId", session.userId || "");
      localStorage.setItem("email", session.email || "");
      localStorage.setItem("role", session.role || "");
      localStorage.setItem("firstName", session.firstName || "");
      localStorage.setItem("lastName", session.lastName || "");
    }
  }, [status, session]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-around bg-white px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32">
      {/* Toaster component for displaying notifications */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="w-full lg:w-1/2 max-w-md py-8 space-y-4">
        <div className="flex justify-center mb-2">
          <img src="/images/auth/logo1.png" alt="logo" className="w-[130px]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full h-[77px] md:w-1/2">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter First Name"
                error={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-[12px] text-red-500 mt-[-14px]">{errors.firstName}</p>
              )}
            </div>

            <div className="w-full h-[77px] md:w-1/2">
              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Last Name"
                error={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-[12px] text-red-500 mt-[-14px]">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="w-full h-[77px]">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              error={!!errors.email}
            />
            {errors.email && (
              <p className="text-[12px] text-red-500 mt-[-14px]">{errors.email}</p>
            )}
          </div>

          <div className="relative w-full h-[77px]">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              error={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[38px] right-4 text-xl text-gray-500"
            >
              {showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
            </button>
            {errors.password && (
              <p className="text-[12px] text-red-500 mt-[-14px]">{errors.password}</p>
            )}
          </div>

          <div className="relative w-full h-[77px]">
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              error={!!errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-[38px] right-4 text-xl text-gray-500"
            >
              {showConfirm ? <HiOutlineEye /> : <HiOutlineEyeOff />}
            </button>
            {errors.confirmPassword && (
              <p className="text-[12px] text-red-500 mt-[-14px]">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition disabled:bg-orange-300"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="flex items-center justify-center">
          <hr className="w-1/3 border-gray-300" />
          <span className="text-gray-400 text-sm px-4">Or</span>
          <hr className="w-1/3 border-gray-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-900 p-3 rounded-full hover:bg-gray-50 transition"
        >
          <img src="/google-20.png" alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-orange-600 font-semibold">
            Log in
          </a>
        </p>
      </div>

      <div className="hidden lg:flex md:ps-10 justify-center mt-14 lg:mt-0">
        <Image
          src="/images/auth/register.jpg"
          alt="Register Illustration"
          width={450}
          height={450}
        />
      </div>
    </div>
  );
}