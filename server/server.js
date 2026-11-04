require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config");
const { User, Product, Order } = require("./models");
const routes = require("./routes");
const { errorHandler } = require("./middleware");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const localDevelopmentOrigins = process.env.NODE_ENV === "production"
  ? []
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = origin?.replace(/\/$/, "");
    if (
      !origin ||
      allowedOrigins.includes(normalizedOrigin) ||
      localDevelopmentOrigins.includes(normalizedOrigin)
    ) {
      return callback(null, true);
    }
    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "ShopDesk API is running", status: "OK" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use(errorHandler);

connectDB()
  .then(() => {
    return User.findOne({ email: "admin@shopdesk.dev" }).select("_id").then(async (demoAdmin) => {
      if (demoAdmin) {
        await Promise.all([
          Product.updateMany({ userId: { $exists: false } }, { $set: { userId: demoAdmin._id } }),
          Order.updateMany({ userId: { $exists: false } }, { $set: { userId: demoAdmin._id } })
        ]);
      }

      app.listen(PORT, () => {
        console.log(`ShopDesk API running at http://localhost:${PORT}`);
      });
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });