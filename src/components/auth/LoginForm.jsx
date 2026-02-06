import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser, isAuthenticated } from "../../utils/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(form);
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gray-300/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Glassmorphism card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Card className="w-full max-w-sm rounded-base border-2 border-border shadow-shadow bg-main">
          <CardHeader>
            <CardTitle className="text-2xl font-heading font-bold text-main-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-main-foreground/70 font-base">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-base font-medium text-main-foreground/80">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <label htmlFor="password" className="text-sm font-base font-medium text-main-foreground/80">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-main-foreground/70 font-base"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                  />
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-500/10 border-2 border-red-500/20 rounded-base p-3 font-base">
                    {error}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-shadow relative overflow-hidden"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                </div>
              )}
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {loading ? 'Signing in...' : 'Login'}
              </span>
            </Button>
            <div className="mt-4 text-center text-sm">
              <span className="text-main-foreground/70 font-base">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="underline underline-offset-4 text-main-foreground hover:text-main-foreground/80 font-base transition-colors"
                >
                  Sign up
                </button>
              </span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}