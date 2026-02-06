import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser, registerUser, isAuthenticated } from "../../utils/auth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  // Update active tab based on route
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(loginForm);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(registerForm);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-main-foreground/20 rounded-full"
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
      
      {/* Auth Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-base border-2 border-border bg-main">
            <TabsTrigger 
              value="login"
              className="rounded-base border-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-heading font-bold"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="rounded-base border-2 border-transparent data-[state=active]:border-border data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-heading font-bold"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="rounded-base border-2 border-border shadow-shadow bg-main">
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-bold text-main-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-main-foreground/70 font-base">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label htmlFor="login-email" className="text-sm font-base font-medium text-main-foreground/80">
                        Email
                      </label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <label htmlFor="login-password" className="text-sm font-base font-medium text-main-foreground/80">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => navigate('/forgot-password')}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-main-foreground/70 font-base"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    
                    {/* Error Message */}
                    {error && activeTab === "login" && (
                      <div className="text-red-500 text-sm text-center bg-red-500/10 border-2 border-red-500/20 rounded-base p-3 font-base">
                        {error}
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-shadow relative overflow-hidden"
                >
                  {loading && activeTab === "login" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className={loading && activeTab === "login" ? 'opacity-0' : 'opacity-100'}>
                    {loading && activeTab === "login" ? 'Signing in...' : 'Login'}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="rounded-base border-2 border-border shadow-shadow bg-main">
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-bold text-main-foreground">Create Account</CardTitle>
                <CardDescription className="text-main-foreground/70 font-base">
                  Join us to start building amazing forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label htmlFor="register-name" className="text-sm font-base font-medium text-main-foreground/80">
                        Full Name
                      </label>
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={registerForm.name}
                        onChange={handleRegisterChange}
                        required
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="register-email" className="text-sm font-base font-medium text-main-foreground/80">
                        Email
                      </label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        required
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="register-password" className="text-sm font-base font-medium text-main-foreground/80">
                        Password
                      </label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        required
                        className="rounded-base border-2 border-border bg-main text-main-foreground placeholder:text-main-foreground/60 font-base focus:ring-0 focus:border-border shadow-none"
                      />
                    </div>
                    
                    {/* Error Message */}
                    {error && activeTab === "register" && (
                      <div className="text-red-500 text-sm text-center bg-red-500/10 border-2 border-red-500/20 rounded-base p-3 font-base">
                        {error}
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full rounded-base border-2 border-border bg-accent text-accent-foreground font-heading font-bold shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-shadow relative overflow-hidden"
                >
                  {loading && activeTab === "register" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className={loading && activeTab === "register" ? 'opacity-0' : 'opacity-100'}>
                    {loading && activeTab === "register" ? 'Creating account...' : 'Create Account'}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}