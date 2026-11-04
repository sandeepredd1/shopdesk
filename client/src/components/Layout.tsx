import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Moon,
  Sun
} from "lucide-react";
import { api, errorMessage } from "../api";
import type { User } from "../api";
import { Toast } from "./UI";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export default function Layout({
  user,
  onLogout,
  darkMode,
  onToggleTheme
}: {
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.post("/auth/logout");
      onLogout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(errorMessage(error));
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] transition-colors duration-300 md:flex">
      {open && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-100 bg-white px-5 py-6 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white">
              S
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">ShopDesk</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400">Store management</p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Workspace</p>
        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
          <p className="mb-4 truncate text-xs text-slate-400">{user.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl border border-slate-200 p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                <Menu size={20} />
              </button>
              <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
                <span>Pages</span><span>/</span>
                <span className="font-semibold text-slate-700">ShopDesk</span>
              </div>
              <label className="relative ml-1 hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && query.trim()) {
                      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-52 rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button aria-label="Notifications" className="relative rounded-xl bg-slate-50 p-2.5 text-slate-500">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <button
                onClick={onToggleTheme}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:text-blue-600"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => navigate("/profile")} className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user.name.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
      {logoutError && (
        <Toast
          message={logoutError}
          kind="error"
          close={() => setLogoutError("")}
        />
      )}
    </div>
  );
}