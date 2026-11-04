const express = require("express");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("node:crypto");
const { User, Product, Order } = require("./models");
const { requireAuth } = require("./middleware");

const router = express.Router();
const categories = ["Electronics", "Clothing", "Home", "Accessories"];
const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || ""
});

function makeToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("shopdesk_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
  });
}

function validateProduct(body) {
  const name = String(body.name || "").trim();
  const category = String(body.category || "");
  const price = Number(body.price);
  const stock = Number(body.stock);
  const imageUrl = String(body.imageUrl || "").trim();

  if (!name) throw Object.assign(new Error("Product name is required"), { status: 400 });
  if (!categories.includes(category)) {
    throw Object.assign(new Error("Select a valid category"), { status: 400 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw Object.assign(new Error("Price must be greater than zero"), { status: 400 });
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw Object.assign(new Error("Stock must be a non-negative whole number"), { status: 400 });
  }

  return { name, category, price, stock, imageUrl };
}

// Public login endpoint.
router.post("/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      return res.status(400).json({ message: "Enter a valid email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = makeToken(user);
    setAuthCookie(res, token);

    res.json({ user: publicUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/signup", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password
    });

    res.status(201).json({
      user: publicUser(user),
      message: "Account created successfully. Please sign in."
    });
  } catch (err) {
    next(err);
  }
});

// Everything below requires authentication.
router.use(requireAuth);

router.get("/auth/me", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie("shopdesk_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  res.json({ message: "Logged out successfully" });
});

// Dashboard stats and the last 14 days of orders.
router.get("/stats", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setHours(0, 0, 0, 0);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

    const [products, orderCount, revenueResult, lowStock, recentOrders, dailyOrders] =
      await Promise.all([
        Product.countDocuments({ userId }),
        Order.countDocuments({ userId }),
        Order.aggregate([
          { $match: { userId, status: { $ne: "Cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]),
        Product.countDocuments({ userId, stock: { $lt: 10 } }),
        Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        Order.aggregate([
          { $match: { userId, createdAt: { $gte: fourteenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

    const byDay = new Map(dailyOrders.map((item) => [item._id, item.orders]));
    const chart = [];

    for (let i = 0; i < 14; i++) {
      const day = new Date(fourteenDaysAgo);
      day.setDate(day.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      chart.push({ date: key, orders: byDay.get(key) || 0 });
    }

    res.json({
      stats: {
        totalProducts: products,
        totalOrders: orderCount,
        revenue: revenueResult[0]?.total || 0,
        lowStock
      },
      chart,
      recentOrders
    });
  } catch (err) {
    next(err);
  }
});

// Products list, search, filter and pagination.
router.get("/products", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "");

    const filter = { userId: req.user._id };
    if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (categories.includes(category)) filter.category = category;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const product = await Product.create({
      ...validateProduct(req.body),
      userId: req.user._id
    });
    res.status(201).json({ product, message: "Product created successfully" });
  } catch (err) {
    next(err);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      validateProduct(req.body),
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product, message: "Product updated successfully" });
  } catch (err) {
    next(err);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// Orders.
router.get("/orders", async (req, res, next) => {
  try {
    const status = String(req.query.status || "");
    const filter = { userId: req.user._id };
    if (statuses.includes(status)) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.post("/orders", async (req, res, next) => {
  try {
    const customerName = String(req.body.customerName || "").trim();
    const items = Number(req.body.items);
    const total = Number(req.body.total);

    if (!customerName) {
      return res.status(400).json({ message: "Customer name is required" });
    }
    if (customerName.length > 100) {
      return res.status(400).json({ message: "Customer name must be 100 characters or fewer" });
    }
    if (!Number.isInteger(items) || items < 1) {
      return res.status(400).json({ message: "Items must be a positive whole number" });
    }
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({ message: "Order total must be greater than zero" });
    }

    const order = await Order.create({
      userId: req.user._id,
      orderNo: `SD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`,
      customerName,
      items,
      total,
      status: "Pending"
    });

    res.status(201).json({ order, message: "Order created successfully" });
  } catch (err) {
    next(err);
  }
});

router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const status = String(req.body.status || "");
    if (!statuses.includes(status)) {
      return res.status(400).json({ message: "Select a valid order status" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order, message: "Order status updated successfully" });
  } catch (err) {
    next(err);
  }
});

// Profile and optional password change.
router.put("/users/me", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) return res.status(400).json({ message: "Name is required" });
      user.name = name;
    }

    if (req.body.avatarUrl !== undefined) {
      user.avatarUrl = String(req.body.avatarUrl).trim();
    }

    if (req.body.newPassword) {
      if (!(await user.comparePassword(String(req.body.currentPassword || "")))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (String(req.body.newPassword).length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      // The schema hashes passwordHash whenever it changes.
      user.passwordHash = String(req.body.newPassword);
    }

    await user.save();
    res.json({ user: publicUser(user), message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;