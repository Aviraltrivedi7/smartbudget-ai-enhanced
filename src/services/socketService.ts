import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/lib/api';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Initialize socket connection
  connect() {
    if (this.socket?.connected) return;

    const token = getAuthToken();
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3,
    });

    this.setupEventHandlers();
  }

  // Setup default event handlers
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });

    this.socket.on('auth_error', (error) => {
      console.error('🔌 Socket authentication error:', error);
      this.disconnect();
    });

    // Real-time transaction events
    this.socket.on('transaction_added', (data) => {
      this.emitToListeners('transaction_added', data);
    });

    this.socket.on('transaction_updated', (data) => {
      this.emitToListeners('transaction_updated', data);
    });

    this.socket.on('transaction_deleted', (data) => {
      this.emitToListeners('transaction_deleted', data);
    });

    // Real-time analytics updates
    this.socket.on('stats_updated', (data) => {
      this.emitToListeners('stats_updated', data);
    });

    // AI insights
    this.socket.on('ai_insight', (data) => {
      this.emitToListeners('ai_insight', data);
    });

    // Budget alerts
    this.socket.on('budget_alert', (data) => {
      this.emitToListeners('budget_alert', data);
    });

    // Goal milestones
    this.socket.on('goal_milestone', (data) => {
      this.emitToListeners('goal_milestone', data);
    });

    // Bill reminders
    this.socket.on('bill_reminder', (data) => {
      this.emitToListeners('bill_reminder', data);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Add event listener
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Remove event listener
  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Emit to all listeners of an event
  private emitToListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket listener for ${event}:`, error);
        }
      });
    }
  }

  // Emit event to server
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Join user room (for user-specific updates)
  joinUserRoom(userId: string) {
    this.emit('join_user_room', { userId });
  }

  // Leave user room
  leaveUserRoom(userId: string) {
    this.emit('leave_user_room', { userId });
  }

  // Request real-time transaction sync
  syncTransactions() {
    this.emit('sync_transactions');
  }

  // Request real-time stats update
  syncStats() {
    this.emit('sync_stats');
  }

  // Send typing indicator for chat/coach
  sendTyping(isTyping: boolean) {
    this.emit('typing', { isTyping });
  }

  // Send heartbeat to keep connection alive
  sendHeartbeat() {
    if (this.isConnected()) {
      this.emit('heartbeat', { timestamp: Date.now() });
    }
  }

  // Auto-reconnect with authentication
  reconnectWithAuth() {
    if (!this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Auto-connect when authenticated
if (typeof window !== 'undefined') {
  const token = getAuthToken();
  if (token) {
    socketService.connect();
  }
}

export default socketService;