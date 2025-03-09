import { ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum ErrorSource {
  SOCKET = 'socket',
  FORM = 'form',
  SIMULATION = 'simulation',
  GENERAL = 'general',
}

export interface ErrorLog {
  id: string
  timestamp: Date
  message: string
  source: ErrorSource
  severity: ErrorSeverity
  details?: any
}

export function useErrorHandler() {
  const errors = ref<ErrorLog[]>([])
  const hasConnectionError = ref(false)

  const logError = (
    message: string,
    source: ErrorSource,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: any,
  ) => {
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      source,
      severity,
      details,
    }

    errors.value.push(errorLog)
    console.error(`[${source}] ${message}`, details || '')

    // Si es un error de conexión, actualizamos el estado
    if (source === ErrorSource.SOCKET && severity === ErrorSeverity.ERROR) {
      hasConnectionError.value = true
    }

    return errorLog.id
  }

  const clearError = (id: string) => {
    const index = errors.value.findIndex((error) => error.id === id)
    if (index !== -1) {
      errors.value.splice(index, 1)
    }
  }

  const notifyUser = (
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    duration: number = 3000,
  ) => {
    ElMessage({
      message,
      type: severity,
      duration,
      showClose: true,
      grouping: true,
    })
  }

  const notifyConnectionStatus = (connected: boolean) => {
    hasConnectionError.value = !connected

    if (connected) {
      ElNotification({
        title: 'Conexión restablecida',
        message: 'La conexión con el servidor ha sido restablecida.',
        type: 'success',
        duration: 3000,
      })
    } else {
      ElNotification({
        title: 'Error de conexión',
        message: 'Se ha perdido la conexión con el servidor. Intentando reconectar...',
        type: 'error',
        duration: 0, // No desaparece automáticamente
      })
    }
  }

  return {
    errors,
    hasConnectionError,
    logError,
    clearError,
    notifyUser,
    notifyConnectionStatus,
  }
}
