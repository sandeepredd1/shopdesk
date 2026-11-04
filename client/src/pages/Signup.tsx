import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, Moon, Package, ShieldCheck, ShoppingBag, Sparkles, Sun, TrendingUp, UserRound } from "lucide-react";
import { api, errorMessage } from "../api";
import { Button } from "../components/UI";

export default function Signup({
  darkMode,
  onToggleTheme
}: {
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password
      });
      navigate("/login", {
        replace: true,
        state: { signupSuccess: "Account created. Sign in with your new credentials." }
      });
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
              A brighter way to <span className="hero-gradient-text">run your store.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-100 xl:text-lg">
              Bring your products, orders, and business insights together in one beautiful workspace.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="hero-feature"><span className="feature-dot" /> All your store operations in one place</div>
              <div className="hero-feature"><span className="feature-dot" /> Clear insights to grow with confidence</div>
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
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="login-card w-full max-w-[440px]"
        >
          <div className="mb-7 lg:hidden">
            <div className="mobile-brand-icon mb-4"><ShoppingBag size={24} /></div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-extrabold text-slate-800">ShopDesk</h1><span className="brand-pill mobile-brand-pill">STORE ADMIN</span></div>
          </div>

          <div className="auth-step mb-5"><span className="auth-step-icon"><Sparkles size={16} /></span><span>GET STARTED</span></div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-[2.1rem]">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Set up your ShopDesk workspace in a few steps.</p>

          <div className="auth-progress mt-6" aria-label="Signup progress"><span /></div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
              <div className="login-input-wrap">
                <UserRound size={18} className="login-input-icon" />
                <input
                  id="signup-name"
                  className="login-input"
                  autoComplete="name"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  className="login-input"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole size={18} className="login-input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input login-password-input"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="login-input-wrap">
                <LockKeyhole size={18} className="login-input-icon" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            {error && <p role="alert" className="login-error">{error}</p>}

            <Button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="auth-link">Sign in <ArrowUpRight size={14} /></Link>
          </p>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"><Package size={14} /> Your store tools, all in one place</p>
        </motion.div>
      </section>
    </main>
  );
}
