const fs = require('fs').promises;
const path = require('path');

// Mock AI parser for prescription
// In real project, integrate Tesseract OCR or external AI API
const parsePrescription = async (filePath) => {
  try {
    // Here you can call real OCR API
    // For now, returning a mock list
    const mockMedicines = [
      { name: 'Paracetamol', quantity: 10 },
      { name: 'Amoxicillin', quantity: 5 }
    ];

    console.log(`✅ Prescription parsed from ${filePath}`);
    return mockMedicines;
  } catch (err) {
    console.error('❌ AI Parser error:', err);
    return [];
  }
};

module.exports = { parsePrescription };
