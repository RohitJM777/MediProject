const amqp = require('amqplib');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

const consumeOrders = async () => {
  let connected = false;
  let conn, channel;

  // Retry loop for RabbitMQ connection
  while (!connected) {
    try {
      conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();
      await channel.assertQueue('order_created', { durable: true });
      connected = true;
      console.log('✅ Connected to RabbitMQ and queue ready');
    } catch (err) {
      console.log('❌ RabbitMQ not ready, retrying in 5s...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  channel.consume('order_created', async (msg) => {
    if (!msg) return;

    try {
      const order = JSON.parse(msg.content.toString());

      // Send Email
      await sendEmail(order.customerEmail, 'Order Placed', `
        <h2>Order Confirmation</h2>
        <p>Dear ${order.customerName},</p>
        <p>Your order #${order._id} has been placed successfully.</p>
      `, {});

      // Send SMS
      await sendSMS(order.customerPhone, `Your order #${order._id} has been placed.`);

      channel.ack(msg);
      console.log(`✅ Processed order ${order._id}`);
    } catch (error) {
      console.error('Error processing order:', error);
      channel.nack(msg, false, true); // Requeue message
    }
  });
};

module.exports = { consumeOrders };
