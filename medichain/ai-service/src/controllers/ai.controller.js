const Analysis = require("../models/Analysis");
const axios = require("axios");
const { analyzePrescription } = require("../ai/engine");

exports.analyzeOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // fetch order details from Order Service
    const orderRes = await axios.get(
      `${process.env.ORDER_SERVICE_URL}/${orderId}`
    );

    const order = orderRes.data;

    const analysis = analyzePrescription(order);

    const saved = await Analysis.create({
      orderId,
      ...analysis
    });

    return res.json({
      message: "AI analysis completed",
      data: saved
    });

  } catch (err) {
    return res.status(500).json({
      message: "AI analysis failed",
      error: err.message
    });
  }
};
