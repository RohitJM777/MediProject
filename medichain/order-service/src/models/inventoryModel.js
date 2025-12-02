const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  stock: Number,
  reorderLevel: Number
});

inventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
