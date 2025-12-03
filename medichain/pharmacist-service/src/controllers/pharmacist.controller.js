const Prescription = require("../models/Prescription");

exports.getAll = async (req, res) => {
  const data = await Prescription.find();
  res.json(data);
};

exports.approveOrder = async (req, res) => {
  const { id } = req.params;

  const updated = await Prescription.findByIdAndUpdate(
    id,
    { status: "APPROVED" },
    { new: true }
  );

  res.json({ msg: "Order approved", updated });
};

exports.rejectOrder = async (req, res) => {
  const { id } = req.params;

  const updated = await Prescription.findByIdAndUpdate(
    id,
    { status: "REJECTED" },
    { new: true }
  );

  res.json({ msg: "Order rejected", updated });
};
