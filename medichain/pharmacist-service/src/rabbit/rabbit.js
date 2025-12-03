const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("🐇 Pharmacist connected to RabbitMQ");
  } catch (err) {
    console.error("❌ Pharmacist RabbitMQ error:", err.message);
  }
};

module.exports = { connectRabbitMQ, getChannel: () => channel };
