import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.email} connected`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Handle real-time transaction updates
    socket.on('transaction_added', (data) => {
      socket.to(`user_${socket.userId}`).emit('transaction_updated', data);
    });
    
    socket.on('transaction_updated', (data) => {
      socket.to(`user_${socket.userId}`).emit('transaction_updated', data);
    });
    
    socket.on('transaction_deleted', (data) => {
      socket.to(`user_${socket.userId}`).emit('transaction_updated', data);
    });

    // Handle budget alerts
    socket.on('budget_alert', (data) => {
      socket.emit('budget_notification', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👋 User ${socket.user.email} disconnected`);
    });
  });
};