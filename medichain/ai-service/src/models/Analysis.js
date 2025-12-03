const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  orderId: String,
  riskScore: Number,
  summary: String,
  medicines: [String],
}, { timestamps: true });

module.exports = mongoose.model("Analysis", analysisSchema);
