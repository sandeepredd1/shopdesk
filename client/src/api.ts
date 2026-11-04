import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});
export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Product {
  _id: string;
  name: string;
  category: "Electronics" | "Clothing" | "Home" | "Accessories";
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNo: string;
  customerName: string;
  items: number | OrderItem | (OrderItem | null | undefined)[] | null;
  total: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

export function orderItemCount(items: Order["items"]): number {
  if (typeof items === "number") return Number.isFinite(items) ? items : 0;

  const lineItems = Array.isArray(items) ? items : items ? [items] : [];
  return lineItems.reduce(
    (count, item) => count + (
      item && Number.isFinite(item.quantity) ? item.quantity : 0
    ),
    0
  );
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the ShopDesk API. Make sure the server is running, MongoDB is reachable, and CLIENT_URL allows this frontend origin.";
    }
    return error.response?.data?.message || error.message || "Request failed";
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}