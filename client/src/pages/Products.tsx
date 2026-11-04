
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,

} from "lucide-react";

import { api, errorMessage, money } from "../api";
import type { Product } from "../api";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  Toast
} from "../components/UI";

const categories = [
  "Electronics",
  "Clothing",
  "Home",
  "Accessories"
];

const blank = {
  name: "",
  category: "Electronics",
  price: "",
  stock: "0",
  imageUrl: ""
};

type FormData = typeof blank;

export default function Products() {
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>({ ...blank });

  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] =
    useState<"success" | "error">("success");

  // NOTIFICATION
  const notify = (
    message: string,
    kind: "success" | "error" = "success"
  ) => {
    setToast(message);
    setToastKind(kind);
  };

  // LOAD PRODUCTS
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products", {
        params: { search, category, page }
      });

      setProducts(response.data.products);
      setPages(Math.max(1, response.data.pagination.pages));
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // SYNC URL PARAMETERS
  useEffect(() => {
    const next = new URLSearchParams();

    if (search) next.set("search", search);
    if (category) next.set("category", category);

    setParams(next, { replace: true });
  }, [search, category, setParams]);

  // OPEN ADD MODAL
  function openAdd() {
    setEditing(null);
    setForm({ ...blank });
    setModal(true);
  }

  // OPEN EDIT MODAL
  function openEdit(product: Product) {
    setEditing(product);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || ""
    });

    setModal(true);
  }

  // CLOSE MODAL
  function closeModal() {
    if (saving) return;

    setModal(false);
    setEditing(null);
    setForm({ ...blank });
  }

  // ESCAPE KEY
  useEffect(() => {
    if (!modal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal, saving]);

  // SAVE PRODUCT
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      return notify("Product name is required", "error");
    }

    if (!categories.includes(form.category)) {
      return notify("Select a valid category", "error");
    }

    if (
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      return notify("Price must be greater than zero", "error");
    }

    if (!/^\d+$/.test(form.stock)) {
      return notify("Stock must be a whole number", "error");
    }

    setSaving(true);

    try {
      const body = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim()
      };

      if (editing) {
        await api.put(`/products/${editing._id}`, body);

        notify("Product updated successfully");
        setModal(false);
        setEditing(null);

        await load();
      } else {
        await api.post("/products", body);

        notify("Product created successfully");
        setModal(false);
        setEditing(null);

        if (page !== 1) {
          setPage(1);
        } else {
          await load();
        }
      }

      setForm({ ...blank });
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  // DELETE PRODUCT
  async function remove(product: Product) {
    if (
      !window.confirm(
        `Delete "${product.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${product._id}`);

      notify("Product deleted successfully");

      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  }

  return (
    <div className="w-full min-w-0 animate-fade-up space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            Workspace / Products
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-800">
            Products
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your catalog and inventory.
          </p>
        </div>

        <Button onClick={openAdd}>
          <Plus size={17} />
          Add product
        </Button>
      </div>

      {/* PRODUCTS CARD */}
      <Card>

        {/* SEARCH AND CATEGORY FILTER */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">

          <label className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="field pl-10"
              placeholder="Search products..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <select
            className="field sm:w-56"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* LOADING */}
        {loading ? (
          <Loading label="Loading products..." />
        ) : error ? (
          <ErrorState
            message={error}
            retry={() => void load()}
          />
        ) : products.length === 0 ? (
          <EmptyState message="No products found. Try a different search or add a product." />
        ) : (
          <>
            {/* PRODUCT TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">

                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Stock</th>
                    <th className="pb-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">

                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 font-bold text-blue-600">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <span className="font-semibold text-slate-700">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4">
                        <Badge status={product.category} />
                      </td>

                      <td className="py-4 font-semibold">
                        {money(product.price)}
                      </td>

                      <td className="py-4">
                        <span
                          className={
                            product.stock < 10
                              ? "font-bold text-red-600"
                              : "text-slate-600"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => void remove(product)}
                            aria-label={`Delete ${product.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

              <p className="text-sm text-slate-400">
                Showing {Math.min((page - 1) * 10 + 1, total)}
                –{Math.min(page * 10, total)} of {total}
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  className="secondary-btn !px-3 !py-2"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-2 text-sm font-semibold">
                  {page} / {pages}
                </span>

                <button
                  type="button"
                  className="secondary-btn !px-3 !py-2"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>
          </>
        )}
      </Card>

      {/* ADD / EDIT PRODUCT POPUP */}
      {modal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              className="my-auto flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >

              <form
                onSubmit={save}
                className="flex min-h-0 flex-1 flex-col"
              >

                {/* POPUP HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      SHOPDESK / PRODUCTS
                    </p>

                    <h2
                      id="product-modal-title"
                      className="mt-1 text-xl font-extrabold text-slate-800"
                    >
                      {editing ? "Edit product" : "Add new product"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Enter your product details below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
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
                      <Package size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Product information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Required fields are marked with *
                      </p>
                    </div>

                  </div> */}

                  {/* PRODUCT NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Product name *
                    </label>

                    <input
                      className="field"
                      required
                      maxLength={120}
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value
                        })
                      }
                      placeholder="e.g. Wireless headphones"
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Category *
                    </label>

                    <select
                      className="field"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value
                        })
                      }
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PRICE AND STOCK */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Price (USD) *
                      </label>

                      <input
                        className="field"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={form.price}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            price: e.target.value
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Stock quantity *
                      </label>

                      <input
                        className="field"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.stock}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            stock: e.target.value
                          })
                        }
                        placeholder="0"
                      />
                    </div>

                  </div>

                  {/* IMAGE URL */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Image URL
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <input
                      className="field"
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          imageUrl: e.target.value
                        })
                      }
                      placeholder="https://example.com/product.jpg"
                    />
                  </div>

                  {/* SMALL IMAGE PREVIEW */}
                  {form.imageUrl && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        IMAGE PREVIEW
                      </p>

                      <img
                        src={form.imageUrl}
                        alt="Product preview"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-28 w-full rounded-lg bg-slate-50 object-contain"
                      />
                    </div>
                  )}

                </div>

                {/* POPUP FOOTER */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Save changes"
                        : "Create product"}
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
