import { AnimatePresence, motion } from "framer-motion";
import { X, LoaderCircle } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = ""
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const styles = {
    primary: "primary-btn",
    secondary: "secondary-btn",
    danger: "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel p-5 ${className}`}>{children}</section>;
}

export function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Shipped: "bg-blue-50 text-blue-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700",
    Electronics: "bg-violet-50 text-violet-700",
    Clothing: "bg-pink-50 text-pink-700",
    Home: "bg-orange-50 text-orange-700",
    Accessories: "bg-cyan-50 text-cyan-700"
  };

  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function Loading({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
      <LoaderCircle className="animate-spin" size={18} />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  retry
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
      <p>{message}</p>
      <button onClick={retry} className="mt-3 font-semibold underline">
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export function Modal({
  open,
  title,
  close,
  children,
  size = "default"
}: {
  open: boolean;
  title: string;
  close: () => void;
  children: ReactNode;
  size?: "default" | "large";
}) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[100] flex overflow-y-auto ${size === "large" ? "items-stretch bg-slate-950 p-0" : "items-center justify-center bg-slate-950/40 p-3 sm:p-6"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`w-full overflow-y-auto bg-white shadow-2xl ${size === "large" ? "m-0 h-dvh max-h-dvh max-w-none rounded-none p-0" : "my-auto max-h-[94vh] max-w-lg rounded-2xl p-5 sm:p-8"}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white ${size === "large" ? "px-5 py-4 sm:px-8 lg:px-12" : "mb-5"}`}>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <button aria-label="Close modal" onClick={close} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className={size === "large" ? "mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" : ""}>
              {children}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function Toast({
  message,
  kind = "success",
  close
}: {
  message: string;
  kind?: "success" | "error";
  close: () => void;
}) {
  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${kind === "success" ? "bg-emerald-600" : "bg-red-600"}`}
    >
      <span>{message}</span>
      <button aria-label="Dismiss notification" onClick={close}>
        <X size={16} />
      </button>
    </div>
  );
}