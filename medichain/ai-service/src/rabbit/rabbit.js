const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("🧠 AI connected to RabbitMQ");
  } catch (error) {
    console.log("❌ RabbitMQ AI error:", error.message);
  }
};

module.exports = { connectRabbitMQ, getChannel: () => channel };
