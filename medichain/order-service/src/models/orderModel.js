const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String, // from Auth Service
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      quantity: Number,
      available: Boolean
    }
  ],
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'completed', 'partial'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
