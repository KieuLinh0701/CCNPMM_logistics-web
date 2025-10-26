import { Server as IOServer } from 'socket.io';

// In-memory registry mapping userId to a set of socket ids
const userIdToSocketIds = new Map();
let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new IOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Client should emit 'register' with its userId after connecting
    socket.on('register', (userId) => {
      if (!userId) return;
      const key = String(userId);
      if (!userIdToSocketIds.has(key)) {
        userIdToSocketIds.set(key, new Set());
      }
      userIdToSocketIds.get(key).add(socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove socket from all user mappings
      for (const [key, set] of userIdToSocketIds.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          if (set.size === 0) userIdToSocketIds.delete(key);
          break;
        }
      }
    });
  });

  return ioInstance;
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  const sockets = userIdToSocketIds.get(String(userId));
  if (!sockets) return;
  
  console.log(`Emitting ${event} to user ${userId}:`, payload);
  for (const sid of sockets) {
    ioInstance.to(sid).emit(event, payload);
  }
}

export function getIO() {
  return ioInstance;
}





