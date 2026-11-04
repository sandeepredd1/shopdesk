const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    avatarUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Home", "Accessories"]
    },
    price: {
      type: Number,
      required: true,
      min: 0.01
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number"
      }
    },
    imageUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

productSchema.index({ userId: 1, createdAt: -1 });

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orderNo: {
      type: String,
      required: true,
      unique: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    items: {
      type: Number,
      required: true,
      min: 1
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = {
  User: mongoose.model("User", userSchema),
  Product: mongoose.model("Product", productSchema),
  Order: mongoose.model("Order", orderSchema)
};