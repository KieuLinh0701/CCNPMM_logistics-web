import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8088/api';
  // derive ws origin by stripping '/api'
  const origin = baseURL.replace(/\/api$/,'');
  socket = io(origin, {
    transports: ['websocket'],
    autoConnect: true,
  });

  // Register current user id if available
  const rawUser = localStorage.getItem('user');
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      if (u?.id) {
        socket.emit('register', u.id);
      }
    } catch {}
  }

  return socket;
}
