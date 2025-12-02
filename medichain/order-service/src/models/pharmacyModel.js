const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // geo index
  },
  phone: String
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
