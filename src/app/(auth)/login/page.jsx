"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import Input from "@/components/ui/Input";
import { signIn, useSession, getSession } from "next-auth/react";
import toast from "react-hot-toast"; // Import toast for better notifications

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(""); // For server-side errors
  const [fieldErrors, setFieldErrors] = useState({}); // For client-side validation errors
  const router = useRouter();
  const { status } = useSession();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // --- Validation Logic ---
  const validateEmail = (email) => {
    if (!email) {
      return "Email is required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required.";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setFieldErrors((prev) => ({
      ...prev,
      email: validateEmail(newEmail),
    }));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setFieldErrors((prev) => ({
      ...prev,
      password: validatePassword(newPassword),
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    // --- Run validation before submitting ---
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return; // Stop the submission if there are errors
    }

    setLoading(true);
    const toastId = toast.loading("Logging in...");

    try {
      // Step 1: Call your backend to validate credentials
      const response = await fetch(`${API_BASE_URL}/auths/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      // Save token and userId in localStorage
      if (data.token && data.userId) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId.toString());
      } else {
        throw new Error("Invalid login response from the server.");
      }

      // Step 2: Trigger NextAuth sign-in to sync the session
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // This error is usually from the NextAuth authorize function
        throw new Error(result.error);
      }

      // Step 3: Refresh session to ensure it's up to date
      await getSession();

      toast.success("Login successful!", { id: toastId });
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Something went wrong.", { id: toastId });
      setApiError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full items-center">
        <div className="hidden md:flex justify-center">
          <img
            src="/images/auth/log in.jpg"
            alt="Login Illustration"
            width={400}
            height={400}
          />
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/images/auth/logo1.png" alt="logo" className="w-[130px]" />
          </div>

          {apiError && (
            <p className="text-red-500 text-center mb-4 font-semibold">{apiError}</p>
          )}

          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              error={fieldErrors.email} // Pass error to Input component
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                error={fieldErrors.password} // Pass error to Input component
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-500 text-xl"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
              </button>
              <div className="text-right mt-1">
                <a
                  href="/forgotpassword"
                  className="text-sm text-gray-500 hover:text-orange-500"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-3 font-semibold transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div className="flex items-center justify-between my-4">
              <hr className="w-1/4 border-gray-300" />
              <span className="text-gray-400 text-sm">Or</span>
              <hr className="w-1/4 border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-900 p-3 rounded-full hover:bg-gray-50 transition"
            >
              <img src="/google-20.png" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>

            <p className="mt-4 text-center text-sm">
              Don’t have an Account?{" "}
              <a
                href="/register"
                className="text-orange-600 font-semibold hover:underline"
              >
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}