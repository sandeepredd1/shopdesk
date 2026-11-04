import { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Package, ShoppingCart, DollarSign, AlertTriangle, RefreshCw
} from "lucide-react";
import { api, errorMessage, money, orderItemCount } from "../api";
import type { Order } from "../api";
import { Badge, Card, EmptyState, ErrorState, Loading } from "../components/UI";

interface StatsData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    lowStock: number;
  };
  chart: { date: string; orders: number }[];
  recentOrders: Order[];
}

export default function Dashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/stats");
      setData(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = data?.stats;
  const statCards = [
    { label: "Total products", value: String(stats?.totalProducts ?? 0), icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total orders", value: String(stats?.totalOrders ?? 0), icon: ShoppingCart, color: "bg-violet-50 text-violet-600" },
    { label: "Total revenue", value: money(stats?.revenue ?? 0), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Low-stock items", value: String(stats?.lowStock ?? 0), icon: AlertTriangle, color: "bg-amber-50 text-amber-600" }
  ];

  if (loading && !data) return <Loading label="Loading your dashboard..." />;
  if (error && !data) return <ErrorState message={error} retry={() => void load()} />;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Overview / Dashboard</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Here's what's happening with your store.</p>
        </div>
        <button onClick={() => void load()} className="secondary-btn">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <ErrorState message={error} retry={() => void load()} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
                <Icon size={21} />
              </div>
            </div>
            <p className="mt-4 break-words text-2xl font-extrabold text-slate-800">{value}</p>
            <p className="mt-2 text-xs text-slate-400">Current store totals</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Orders overview</h2>
              <p className="mt-1 text-sm text-slate-400">Daily orders over the last 14 days</p>
            </div>
          </div>
          <div className="h-72">
            {data?.chart.every((day) => day.orders === 0) ? (
              <EmptyState message="Order activity will appear here when your first order is created." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chart || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf1f7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) => date.slice(5)}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#ordersFill)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-800">Inventory attention</h2>
          <p className="mt-1 text-sm text-slate-400">Products with fewer than 10 units</p>
          <div className="mt-6 flex items-center gap-4 rounded-xl bg-amber-50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-amber-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{stats?.lowStock ?? 0}</p>
              <p className="text-xs text-slate-500">Products need attention</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Review your inventory and replenish products before they run out.
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-5">
          <h2 className="font-bold text-slate-800">Recent orders</h2>
          <p className="mt-1 text-sm text-slate-400">Your five most recent orders</p>
        </div>
        {!data?.recentOrders.length ? (
          <EmptyState message="No orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-4 font-bold text-blue-700">{order.orderNo}</td>
                    <td className="py-4 text-slate-600">{order.customerName}</td>
                    <td className="py-4 text-slate-500">{orderItemCount(order.items)}</td>
                    <td className="py-4 font-semibold">{money(order.total)}</td>
                    <td className="py-4"><Badge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}