import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, Moon, Package, ShoppingBag, ShieldCheck, Sparkles, Sun, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api, errorMessage } from "../api";
import type { User } from "../api";
import { Button } from "../components/UI";

export default function Login({
  onLogin,
  darkMode,
  onToggleTheme
}: {
  onLogin: (user: User) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const location = useLocation();
  const signupSuccess = (location.state as { signupSuccess?: string } | null)?.signupSuccess;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      onLogin(response.data.user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page relative flex min-h-screen bg-white">
      <button
        onClick={onToggleTheme}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        className="auth-theme-toggle"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <section className="login-hero relative hidden min-h-screen flex-1 flex-col justify-between overflow-hidden p-10 text-white xl:p-14 lg:flex">
        <div className="login-grid" />
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="brand-icon"><ShoppingBag size={24} /></div>
          <span className="text-2xl font-extrabold">ShopDesk</span>
          <span className="brand-pill ml-1">STORE ADMIN</span>
        </div>
        <div className="relative z-10 grid items-center gap-10 2xl:grid-cols-[1fr_0.9fr]">
          <div className="max-w-xl">
            <div className="hero-badge mb-6 inline-flex items-center gap-2"><Sparkles size={14} /> YOUR BUSINESS, IN SYNC</div>
            <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl 2xl:text-6xl">
              Manage your store. <span className="hero-gradient-text">Grow with clarity.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-100 xl:text-lg">
              Products, orders, and performance insights—everything you need in one calm, clear workspace.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="hero-feature"><span className="feature-dot" /> Know what needs your attention</div>
              <div className="hero-feature"><span className="feature-dot" /> Keep every order moving forward</div>
            </div>
          </div>
          <motion.div
            className="hero-preview hidden 2xl:block"
            initial={{ opacity: 0, y: 18, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Store overview</p>
                <p className="mt-1 text-xs text-blue-100/70">Your business at a glance</p>
              </div>
              <div className="preview-icon"><TrendingUp size={21} /></div>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[.07] p-3">
                <p className="text-[11px] text-blue-100/70">Total orders</p>
                <p className="mt-1 text-xl font-bold text-white">1,284</p>
                <p className="mt-1 text-[10px] font-semibold text-cyan-200">↗ 12.8% this month</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.07] p-3">
                <p className="text-[11px] text-blue-100/70">Products</p>
                <p className="mt-1 text-xl font-bold text-white">248</p>
                <p className="mt-1 text-[10px] font-semibold text-cyan-200">Ready to sell</p>
              </div>
            </div>
            <p className="mb-3 text-xs font-semibold text-blue-100/80">Weekly performance</p>
            <div className="preview-bars">
              {[36, 54, 43, 76, 57, 91, 69, 100].map((height, index) => (
                <div key={index} className="preview-bar" style={{ height: `${height}%` }} />
              ))}
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm text-blue-100"><ShieldCheck size={16} /> A secure workspace built around your store</div>
      </section>

      <section className="login-panel flex flex-1 items-center justify-center px-5 py-12 sm:px-10 xl:px-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="login-card w-full max-w-[440px]"
        >
          <div className="mb-8 lg:hidden">
            <div className="mobile-brand-icon mb-4"><ShoppingBag size={24} /></div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-extrabold text-slate-800">ShopDesk</h1><span className="brand-pill mobile-brand-pill">STORE ADMIN</span></div>
          </div>

          <div className="auth-step mb-5"><span className="auth-step-icon"><Sparkles size={16} /></span><span>WELCOME BACK</span></div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-[2.1rem]">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Enter your details to access the dashboard.</p>

          {signupSuccess && <p role="status" className="auth-success mt-5">{signupSuccess}</p>}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="login-input login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Signing in..." : "Sign in to ShopDesk"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to ShopDesk? <Link to="/signup" className="auth-link">Create an account <ArrowUpRight size={14} /></Link>
          </p>

          <div className="demo-box mt-7">
            <div className="demo-icon"><Package size={19} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">Want to explore first?</p>
              <p className="mt-1 text-xs text-slate-500">Use the demo account to preview your workspace.</p>
              <p className="mt-2 text-xs font-semibold text-blue-700">admin@shopdesk.dev <span className="text-slate-400">·</span> Admin@123</p>
            </div>
            <span className="demo-status">DEMO</span>
          </div>

          <p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} /> Secure access to your store workspace
          </p>
        </motion.div>
      </section>
    </main>
  );
}