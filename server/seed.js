require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config");
const { User, Product, Order } = require("./models");

const categories = ["Electronics", "Clothing", "Home", "Accessories"];

const products = [
  ["Wireless Headphones", "Electronics", 79.99, 24],
  ["Smart Watch", "Electronics", 129.99, 8],
  ["Bluetooth Speaker", "Electronics", 49.99, 35],
  ["USB-C Hub", "Electronics", 39.99, 17],
  ["Laptop Stand", "Electronics", 44.99, 6],
  ["Mechanical Keyboard", "Electronics", 89.99, 20],
  ["Wireless Mouse", "Electronics", 29.99, 40],
  ["Webcam HD", "Electronics", 59.99, 9],
  ["Phone Charger", "Electronics", 19.99, 50],
  ["Power Bank", "Electronics", 34.99, 13],
  ["Cotton T-Shirt", "Clothing", 19.99, 42],
  ["Denim Jeans", "Clothing", 49.99, 15],
  ["Hoodie", "Clothing", 39.99, 7],
  ["Casual Shirt", "Clothing", 29.99, 23],
  ["Running Jacket", "Clothing", 64.99, 12],
  ["Sports Shorts", "Clothing", 24.99, 28],
  ["Winter Scarf", "Clothing", 17.99, 5],
  ["Canvas Sneakers", "Clothing", 54.99, 19],
  ["Ceramic Mug", "Home", 12.99, 60],
  ["Desk Lamp", "Home", 32.99, 14],
  ["Throw Pillow", "Home", 21.99, 31],
  ["Water Bottle", "Home", 18.99, 4],
  ["Wall Clock", "Home", 27.99, 16],
  ["Storage Basket", "Home", 15.99, 25],
  ["Desk Organizer", "Home", 22.99, 11],
  ["Leather Wallet", "Accessories", 34.99, 18],
  ["Sunglasses", "Accessories", 25.99, 3],
  ["Travel Backpack", "Accessories", 69.99, 10],
  ["Keychain", "Accessories", 8.99, 75],
  ["Minimalist Watch", "Accessories", 99.99, 6]
];

const customers = [
  "Alex Morgan", "Jamie Wilson", "Taylor Brown", "Jordan Lee",
  "Morgan Davis", "Casey Miller", "Riley Garcia", "Avery Martin",
  "Cameron White", "Drew Thompson"
];

async function seed() {
  try {
    await connectDB();

    // Upsert prevents duplicate demo users.
    let admin = await User.findOne({ email: "admin@shopdesk.dev" });

    if (!admin) {
      admin = await User.create({
        name: "ShopDesk Admin",
        email: "admin@shopdesk.dev",
        passwordHash: "Admin@123",
        avatarUrl: ""
      });
    } else {
      admin.name = "ShopDesk Admin";
      admin.passwordHash = "Admin@123";
      await admin.save();
    }

    await Promise.all([
      Product.updateMany({ userId: { $exists: false } }, { $set: { userId: admin._id } }),
      Order.updateMany({ userId: { $exists: false } }, { $set: { userId: admin._id } })
    ]);

    // Reset demo records only; other accounts keep their own data.
    await Promise.all([
      Product.deleteMany({ userId: admin._id }),
      Order.deleteMany({ userId: admin._id })
    ]);

    await Product.insertMany(
      products.map(([name, category, price, stock]) => ({
        name,
        category,
        price,
        stock,
        imageUrl: "",
        userId: admin._id
      }))
    );

    const now = Date.now();
    const orders = Array.from({ length: 50 }, (_, index) => {
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
      const items = 1 + Math.floor(Math.random() * 5);
      const total = Number((25 + Math.random() * 475).toFixed(2));
      const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

      return {
        userId: admin._id,
        orderNo: `SD-${String(index + 1).padStart(5, "0")}`,
        customerName: customers[index % customers.length],
        items,
        total,
        status: statuses[index % statuses.length],
        createdAt: date,
        updatedAt: date
      };
    });

    await Order.insertMany(orders);

    console.log("Seed completed successfully!");
    console.log("Demo email: admin@shopdesk.dev");
    console.log("Demo password: Admin@123");
    console.log("Products created: 30");
    console.log("Orders created: 50");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seed();