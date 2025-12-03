const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("📦 Pharmacist MongoDB connected");
  } catch (err) {
    console.log("❌ Pharmacist MongoDB error:", err);
  }
};

module.exports = connectDB;
