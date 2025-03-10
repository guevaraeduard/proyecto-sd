import { io, Socket } from 'socket.io-client'
import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null as Socket | null,
    isConnected: false,
    connectionError: null as Error | null,
  }),

  actions: {
    connect() {
      if (this.socket) {
        return
      }

      try {
        this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000')

        this.socket.on('connect', () => {
          this.isConnected = true
          this.connectionError = null
        })

        this.socket.on('disconnect', () => {
          this.isConnected = false
        })

        this.socket.on('connect_error', (error) => {
          this.isConnected = false
          this.connectionError = error
        })
      } catch (error) {
        this.connectionError = error as Error
        throw error
      }
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.isConnected = false
      }
    },

    emit(event: string, data?: any) {
      if (!this.socket) {
        throw new Error('Socket not connected')
      }

      this.socket.emit(event, data)
    },

    on(event: string, callback: (...args: any[]) => void) {
      if (!this.socket) {
        throw new Error('Socket not connected')
      }

      this.socket.on(event, callback)
    },

    off(event: string, callback?: (...args: any[]) => void) {
      if (!this.socket) {
        return
      }

      this.socket.off(event, callback)
    },

    onConnect(callback: () => void) {
      if (!this.socket) {
        throw new Error('Socket not connected')
      }

      this.socket.on('connect', callback)
    },

    onDisconnect(callback: (reason: any) => void) {
      if (!this.socket) {
        throw new Error('Socket not connected')
      }

      this.socket.on('disconnect', callback)
    },

    onError(callback: (error: Error) => void) {
      if (!this.socket) {
        throw new Error('Socket not connected')
      }

      this.socket.on('connect_error', callback)
    },
  },
})
