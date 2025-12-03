const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    prescriptionImage: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
