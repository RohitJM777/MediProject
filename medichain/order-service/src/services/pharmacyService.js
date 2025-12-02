const Inventory = require('../models/inventoryModel');
const Pharmacy = require('../models/pharmacyModel');
const Medicine = require('../models/medicineModel');

// Find pharmacies that have medicine in stock
const findPharmacyWithStock = async (medicineName, quantity, userLocation) => {
  // Search medicine by name
  const medicine = await Medicine.findOne({ name: { $regex: medicineName, $options: 'i' } });
  if (!medicine) return null;

  // Aggregate inventory + pharmacy distance (if userLocation provided)
  const pharmacies = await Inventory.aggregate([
    { $match: { medicineId: medicine._id, stock: { $gte: quantity } } },
    {
      $lookup: {
        from: 'pharmacies',
        localField: 'pharmacyId',
        foreignField: '_id',
        as: 'pharmacy'
      }
    },
    { $unwind: '$pharmacy' },
    // Optional: sort by nearest if userLocation provided
    ...(userLocation
      ? [
          {
            $addFields: {
              distance: {
                $sqrt: {
                  $add: [
                    { $pow: [{ $subtract: ['$pharmacy.location.coordinates.0', userLocation.lng] }, 2] },
                    { $pow: [{ $subtract: ['$pharmacy.location.coordinates.1', userLocation.lat] }, 2] }
                  ]
                }
              }
            }
          },
          { $sort: { distance: 1 } }
        ]
      : []),
    { $limit: 1 }
  ]);

  return pharmacies.length ? pharmacies[0] : null;
};

module.exports = { findPharmacyWithStock };
