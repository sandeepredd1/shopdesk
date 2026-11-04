const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing from server/.env");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000
  });

  console.log("MongoDB connected successfully");
}

module.exports = connectDB;