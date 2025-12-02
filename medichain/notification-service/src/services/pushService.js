let connectedUsers = new Map(); // userId -> socketId

const registerUser = (userId, socketId) => {
  connectedUsers.set(userId, socketId);
};

const removeUser = (socketId) => {
  for (const [userId, sId] of connectedUsers.entries()) {
    if (sId === socketId) connectedUsers.delete(userId);
  }
};

const sendPush = (io, userId, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', data);
    console.log(`Push notification sent to user ${userId}`);
    return true;
  }
  return false;
};

module.exports = { registerUser, removeUser, sendPush, connectedUsers };
