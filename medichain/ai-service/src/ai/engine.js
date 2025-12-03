module.exports.analyzePrescription = (order) => {
  const medicines = order.medicines || [];

  const risky = ["Morphine", "Codeine"];
  const riskyFound = medicines.filter(m => risky.includes(m));

  return {
    riskScore: riskyFound.length > 0 ? 8 : 2,
    summary: riskyFound.length
      ? "High-risk medicines detected!"
      : "Prescription safe.",
    medicines: medicines,
  };
};
