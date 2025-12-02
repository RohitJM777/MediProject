require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { registerUser, removeUser, sendPush, connectedUsers } = require('./services/pushService');
const { consumeOrders } = require('./consumers/orderConsumer');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('authenticate', (userId) => registerUser(userId, socket.id));
  socket.on('disconnect', () => removeUser(socket.id));
});

// Test route
app.get('/health', (req, res) => res.json({ status: 'OK', connectedUsers: connectedUsers.size }));

// Start server
const PORT = process.env.PORT || 5008;
server.listen(PORT, async () => {
  console.log(`Notification Service running on port ${PORT}`);
  await consumeOrders(); // Start RabbitMQ consumer
});
