import { io, Socket } from 'socket.io-client'
import { defineStore } from 'pinia'

class SocketManager {
  private socket: Socket | null = null

  constructor() {
    console.log('eduard')
  }

  public connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000')
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null // Limpiar la variable
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  public emit(event: string, ...args: any[]) {
    if (this.socket) {
      this.socket.emit(event, ...args)
    }
  }
}

// Nueva tienda de Pinia para manejar el socket
export const useSocketStore = defineStore('socket', {
  state: () => ({
    socketManager: new SocketManager(),
  }),
  actions: {
    connect() {
      this.socketManager.connect()
    },
    disconnect() {
      this.socketManager.disconnect()
    },
    on(event: string, callback: (...args: any[]) => void) {
      this.socketManager.on(event, callback)
    },
    emit(event: string, ...args: any[]) {
      this.socketManager.emit(event, ...args)
    },
  },
})
