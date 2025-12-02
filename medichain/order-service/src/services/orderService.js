const Order = require('../models/orderModel');
const Inventory = require('../models/inventoryModel');
const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log('✅ RabbitMQ connected - Order Service');
};

connectRabbitMQ();

const createOrder = async ({ userId, items, pharmacyId }) => {
  // Check inventory availability
  const updatedItems = await Promise.all(
    items.map(async (item) => {
      const inv = await Inventory.findOne({ pharmacyId, medicineId: item.medicineId });
      if (!inv || inv.stock < item.quantity) {
        return { ...item, available: false };
      }
      // Reduce stock
      inv.stock -= item.quantity;
      await inv.save();
      return { ...item, available: true };
    })
  );

  const totalAmount = updatedItems.reduce((sum, i) => sum + (i.available ? i.quantity * i.price || 0 : 0), 0);
  const status = updatedItems.every(i => i.available) ? 'completed' : 'partial';

  const order = await Order.create({ userId, pharmacyId, items: updatedItems, totalAmount, status });

  // Send to RabbitMQ for notification or wholesaler
  if (channel) {
    await channel.assertQueue('order_created', { durable: true });
    channel.sendToQueue('order_created', Buffer.from(JSON.stringify({ orderId: order._id, userId })));
  }

  return order;
};

module.exports = { createOrder };
