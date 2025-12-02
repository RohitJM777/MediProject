const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  description: String,
  category: String,
  price: Number,
  packSize: String
});

medicineSchema.index({ name: 'text', brand: 'text', category: 'text' }); // full text search

module.exports = mongoose.model('Medicine', medicineSchema);
