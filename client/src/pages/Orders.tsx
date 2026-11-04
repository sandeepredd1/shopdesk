
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CircleDollarSign,
  Plus,
  RefreshCw,
  ShoppingCart,
  UserRound,
  
  X
} from "lucide-react";

import { api, errorMessage, money, orderItemCount } from "../api";
import type { Order } from "../api";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  Toast
} from "../components/UI";

const statuses = [
  "Pending",
  "Shipped",
  "Delivered",
  "Cancelled"
];

const blankOrder = {
  customerName: "",
  items: "1",
  total: ""
};

export default function Orders() {
  const [status, setStatus] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] =
    useState<"success" | "error">("success");

  const [updating, setUpdating] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ ...blankOrder });
  const [creating, setCreating] = useState(false);

  // NOTIFICATION
  const notify = (
    message: string,
    kind: "success" | "error" = "success"
  ) => {
    setToast(message);
    setToastKind(kind);
  };

  // LOAD ORDERS
  const load = useCallback(async (filterStatus = status) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/orders", {
        params: filterStatus
          ? { status: filterStatus }
          : {}
      });

      setOrders(response.data.orders);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  // OPEN CREATE ORDER POPUP
  function openCreate() {
    setNewOrder({ ...blankOrder });
    setCreateOpen(true);
  }

  // CLOSE CREATE ORDER POPUP
  function closeCreate() {
    if (creating) return;

    setCreateOpen(false);
    setNewOrder({ ...blankOrder });
  }

  // ESCAPE KEY
  useEffect(() => {
    if (!createOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !creating) {
        setCreateOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [createOpen, creating]);

  // UPDATE ORDER STATUS
  async function changeStatus(
    order: Order,
    nextStatus: string
  ) {
    if (nextStatus === order.status) return;

    setUpdating(order._id);

    try {
      await api.patch(
        `/orders/${order._id}/status`,
        { status: nextStatus }
      );

      notify(`Order ${order.orderNo} updated`);

      await load();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setUpdating("");
    }
  }

  // CREATE ORDER
  async function createOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const customerName = newOrder.customerName.trim();
    const itemCount = Number(newOrder.items);
    const total = Number(newOrder.total);

    if (!customerName) {
      return notify("Customer name is required", "error");
    }

    if (
      !Number.isInteger(itemCount) ||
      itemCount < 1
    ) {
      return notify(
        "Items must be a positive whole number",
        "error"
      );
    }

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return notify(
        "Order total must be greater than zero",
        "error"
      );
    }

    setCreating(true);

    try {
      await api.post("/orders", {
        customerName,
        items: itemCount,
        total
      });

      notify("Order created successfully");

      setNewOrder({ ...blankOrder });
      setCreateOpen(false);
      setStatus("");

      await load("");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="w-full min-w-0 animate-fade-up space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>
          <p className="text-sm text-slate-400">
            Workspace / Orders
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
            Orders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track customer orders and update fulfillment status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            className="secondary-btn"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Button onClick={openCreate}>
            <Plus size={16} />
            Add order
          </Button>

        </div>
      </div>

      {/* ORDERS TABLE */}
      <Card>

        {/* TABLE HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="font-bold text-slate-800">
              All orders
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {orders.length} orders in this view
            </p>
          </div>

          <select
            className="field sm:w-52"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>

            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

        </div>

        {/* LOADING / ERROR / EMPTY */}
        {loading ? (
          <Loading label="Loading orders..." />
        ) : error ? (
          <ErrorState
            message={error}
            retry={() => void load()}
          />
        ) : orders.length === 0 ? (
          <EmptyState message="No orders match this status." />
        ) : (

          /* ORDER TABLE */
          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px] text-left text-sm">

              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">

                <tr>
                  <th className="pb-3 font-semibold">
                    Order number
                  </th>

                  <th className="pb-3 font-semibold">
                    Customer
                  </th>

                  <th className="pb-3 font-semibold">
                    Items
                  </th>

                  <th className="pb-3 font-semibold">
                    Date
                  </th>

                  <th className="pb-3 font-semibold">
                    Total
                  </th>

                  <th className="pb-3 font-semibold">
                    Status
                  </th>

                  <th className="pb-3 font-semibold">
                    Update
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-50">

                {orders.map((order) => (

                  <tr
                    key={order._id}
                    className="transition hover:bg-slate-50/70"
                  >

                    <td className="py-4 font-bold text-blue-700">
                      {order.orderNo}
                    </td>

                    <td className="py-4 font-medium text-slate-600">
                      {order.customerName}
                    </td>

                    <td className="py-4 text-slate-500">
                      {orderItemCount(order.items)}
                    </td>

                    <td className="py-4 text-slate-500">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="py-4 font-semibold">
                      {money(order.total)}
                    </td>

                    <td className="py-4">
                      <Badge status={order.status} />
                    </td>

                    <td className="py-4">
                      <select
                        aria-label={`Update status for ${order.orderNo}`}
                        className="field min-w-32 !px-2 !py-2"
                        value={order.status}
                        disabled={updating === order._id}
                        onChange={(e) =>
                          void changeStatus(
                            order,
                            e.target.value
                          )
                        }
                      >
                        {statuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </Card>

      {/* CREATE ORDER POPUP */}
      {createOpen &&
        createPortal(

          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCreate();
              }
            }}
          >

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-order-title"
              className="my-auto flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >

              <form
                onSubmit={createOrder}
                className="flex min-h-0 flex-1 flex-col"
              >

                {/* POPUP HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      SHOPDESK / ORDERS
                    </p>

                    <h2
                      id="create-order-title"
                      className="mt-1 text-xl font-extrabold text-slate-800"
                    >
                      Create new order
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter customer and purchase details.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeCreate}
                    disabled={creating}
                    aria-label="Close popup"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>

                </div>

                {/* POPUP BODY - SINGLE COLUMN */}
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">

                  {/* SECTION HEADER */}
                  {/* <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">

                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
                      <PackageCheck size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Order information
                      </h3>

                      <p className="text-xs text-slate-500">
                        New orders start with Pending status.
                      </p>
                    </div>

                  </div> */}

                  {/* CUSTOMER NAME */}
                  <div>

                    <label
                      htmlFor="order-customer"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Customer name *
                    </label>

                    <div className="relative">

                      <UserRound
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="order-customer"
                        className="field !py-3 !pl-10"
                        value={newOrder.customerName}
                        onChange={(event) =>
                          setNewOrder({
                            ...newOrder,
                            customerName: event.target.value
                          })
                        }
                        maxLength={100}
                        required
                        placeholder="Enter customer name"
                      />

                    </div>

                  </div>

                  {/* ITEMS */}
                  <div>

                    <label
                      htmlFor="order-items"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Number of items *
                    </label>

                    <div className="relative">

                      <ShoppingCart
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="order-items"
                        className="field !py-3 !pl-10"
                        type="number"
                        min="1"
                        step="1"
                        value={newOrder.items}
                        onChange={(event) =>
                          setNewOrder({
                            ...newOrder,
                            items: event.target.value
                          })
                        }
                        required
                      />

                    </div>

                  </div>

                  {/* ORDER TOTAL */}
                  <div>

                    <label
                      htmlFor="order-total"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Order total (USD) *
                    </label>

                    <div className="relative">

                      <CircleDollarSign
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="order-total"
                        className="field !py-3 !pl-10"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newOrder.total}
                        onChange={(event) =>
                          setNewOrder({
                            ...newOrder,
                            total: event.target.value
                          })
                        }
                        required
                        placeholder="0.00"
                      />

                    </div>

                  </div>

                  {/* ORDER STATUS INFO */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Initial order status
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Automatically assigned
                      </p>
                    </div>

                    <Badge status="Pending" />

                  </div>

                </div>

                {/* POPUP FOOTER */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={creating}
                    onClick={closeCreate}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={creating}
                  >
                    {creating
                      ? "Creating..."
                      : "Create order"}
                  </Button>

                </div>

              </form>

            </div>

          </div>,

          document.body
        )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast}
          kind={toastKind}
          close={() => setToast("")}
        />
      )}

    </div>
  );
}
