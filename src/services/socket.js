import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

let socket = null;

/**
 * Get or initialize singleton Socket.io client instance
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      // Join the admin notification channel
      socket.emit('join:admin');
    });

    socket.on('connect_error', (error) => {
      console.warn('[Admin WS] Connection error:', error.message);
    });
  }

  return socket;
}

/**
 * Subscribe to an event
 */
export function subscribeSocket(event, callback) {
  const s = getSocket();
  s.on(event, callback);

  return () => {
    s.off(event, callback);
  };
}

/**
 * Emit an event
 */
export function emitSocket(event, data, callback) {
  const s = getSocket();
  s.emit(event, data, callback);
}

export default {
  getSocket,
  subscribeSocket,
  emitSocket,
};
