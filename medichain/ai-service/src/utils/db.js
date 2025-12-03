const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("🧠 AI Service MongoDB connected");
  } catch (err) {
    console.log("❌ AI DB error:", err);
  }
};

module.exports = connectDB;
