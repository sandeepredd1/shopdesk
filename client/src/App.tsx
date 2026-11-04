import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import { api, errorMessage } from "./api";
import type { User } from "./api";
import { ErrorState, Loading } from "./components/UI";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("shopdesk-theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("shopdesk-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((enabled) => !enabled);

  const restoreSession = useCallback(async () => {
    setChecking(true);
    setSessionError("");
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
      if (!(axios.isAxiosError(err) && err.response?.status === 401)) {
        setSessionError(errorMessage(err));
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { void restoreSession(); }, [restoreSession]);

  if (checking) {
    return <Loading label="Restoring your session..." />;
  }
  if (sessionError) {
    return <ErrorState message={sessionError} retry={() => void restoreSession()} />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/" replace />
            : <Login onLogin={setUser} darkMode={darkMode} onToggleTheme={toggleTheme} />
        }
      />
      <Route
        path="/signup"
        element={
          user
            ? <Navigate to="/" replace />
            : <Signup darkMode={darkMode} onToggleTheme={toggleTheme} />
        }
      />

      <Route
        path="/"
        element={
          user
            ? <Layout user={user} onLogout={() => setUser(null)} darkMode={darkMode} onToggleTheme={toggleTheme} />
            : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile user={user!} onUserChange={setUser} />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}