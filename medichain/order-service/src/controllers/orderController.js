const multer = require('multer');
const path = require('path');
const { parsePrescription } = require('../services/aiService');
const { findPharmacyWithStock } = require('../services/pharmacyService');
const { createOrder } = require('../services/orderService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

const uploadPrescription = [
  upload.single('prescription'),
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const userLocation = req.body.location ? JSON.parse(req.body.location) : null;

      const medicines = await parsePrescription(req.file.path);

      const orderItems = [];
      for (const med of medicines) {
        const pharmacyStock = await findPharmacyWithStock(med.name, med.quantity, userLocation);
        if (!pharmacyStock) {
          // TODO: send to wholesaler
          orderItems.push({ medicineName: med.name, quantity: med.quantity, available: false });
        } else {
          orderItems.push({ medicineId: pharmacyStock.medicineId, quantity: med.quantity, available: true });
        }
      }

      // Create order
      const pharmacyId = orderItems.find(i => i.available)?.pharmacyId || null;
      const order = await createOrder({ userId, items: orderItems, pharmacyId });

      res.json({ success: true, order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to process prescription' });
    }
  }
];

module.exports = { uploadPrescription };
