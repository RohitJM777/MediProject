const Prescription = require("../models/Prescription");
const { getChannel } = require("../rabbit/rabbit");

const QUEUE = "order_created";

async function orderConsumer() {
  const channel = getChannel();
  if (!channel) return console.log("❌ Pharmacist channel not ready");

  await channel.assertQueue(QUEUE, { durable: true });

  console.log("📥 Pharmacist listening on:", QUEUE);

  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log("📨 Pharmacist received:", data);

    await Prescription.create({
      orderId: data.orderId,
      patientEmail: data.email,
      prescriptionImage: data.image || null
    });

    channel.ack(msg);
  });
}

module.exports = orderConsumer;
