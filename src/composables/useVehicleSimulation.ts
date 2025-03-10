import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { Status } from '@/types/status'
import { uid } from 'uid'
import type { ListVehicle } from '@/types/listVehicle'
import { useSocketStore } from '@/socket/socket'
import { useErrorHandler, ErrorSource, ErrorSeverity } from '@/composables/useErrorHandler'

export function useVehicleSimulation() {
  // Variables de estado
  const direction = ref('Izquierda')
  const speed = ref(10)
  const delay = ref(0)
  const show_form = ref(true)
  const name = ref('')
  const status = ref<Status>({ state: 'En la cola' })
  const shift = ref(false)
  const loading = ref(false)
  const id_user = ref('')
  const crossing = ref(false)
  const list_vehicles = ref<ListVehicle[]>([])
  const countdown = ref(0)
  const myPosition = ref(0)
  const animation = ref({
    animationDuration: '10s',
    animationIterationCount: 'infinite',
  })
  const animationInverse = ref({
    animationDuration: '10s',
    animationIterationCount: 'infinite',
  })
  const socket = useSocketStore()
  const animation_direction = ref('Izquierda')
  const progress = ref(0)
  const time_process = ref(false)
  const countdownInterval = ref<number | null>(null)

  const { logError, notifyUser, notifyConnectionStatus, hasConnectionError } = useErrorHandler()

  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectInterval = ref<number | null>(null)
  const isReconnecting = ref(false)

  // Funciones
  const checkExistingSession = async () => {
    return new Promise<boolean>((resolve) => {
      if (localStorage.getItem('id_user')) {
        const storedId = localStorage.getItem('id_user')!

        socket.emit('checkExistingUser', { id_user: storedId })

        const handleResponse = (exists: boolean) => {
          if (exists) {
            id_user.value = storedId
            name.value = localStorage.getItem('name')!
            direction.value = localStorage.getItem('direction')!
            speed.value = parseInt(localStorage.getItem('speed')!)
            delay.value = parseInt(localStorage.getItem('delay')!)

            socket.emit('rejoinSimulation', {
              id_user: id_user.value,
              name: name.value,
              direction: direction.value,
              speed: speed.value,
              delay: delay.value,
            })

            loading.value = true
            show_form.value = false
            resolve(true)
          } else {
            localStorage.clear()
            resolve(false)
          }

          socket.off('existingUserResponse', handleResponse)
        }

        socket.on('existingUserResponse', handleResponse)

        setTimeout(() => {
          socket.off('existingUserResponse', handleResponse)
          resolve(false)
        }, 5000)
      } else {
        resolve(false)
      }
    })
  }

  const startSimulation = async () => {
    if (!speed.value || !delay.value || !name.value || !direction.value) {
      notifyUser('Por favor, complete todos los campos.', ErrorSeverity.ERROR)
      return
    }

    loading.value = true

    try {
      if (!id_user.value) {
        id_user.value = uid()
        localStorage.setItem('id_user', id_user.value)
        localStorage.setItem('name', name.value)
        localStorage.setItem('direction', direction.value)
        localStorage.setItem('speed', speed.value.toString())
        localStorage.setItem('delay', delay.value.toString())
      }

      socket.emit('checkExistingUser', { id_user: id_user.value })

      socket.on('existingUserResponse', (exists: boolean) => {
        if (exists) {
          notifyUser(
            'Ya existe una sesión activa con este usuario. Se cerrará la sesión anterior.',
            ErrorSeverity.WARNING,
          )

          socket.emit('forceLeave', { id_user: id_user.value })

          setTimeout(() => {
            joinSimulation()
          }, 1000)
        } else {
          joinSimulation()
        }
      })
    } catch (error) {
      loading.value = false
      logError('Error al unirse a la cola', ErrorSource.SOCKET, ErrorSeverity.ERROR, error)
      notifyUser('No se pudo conectar al servidor. Intente nuevamente.', ErrorSeverity.ERROR)
    }
  }

  const joinSimulation = () => {
    socket.emit('joinLine', {
      id_user: id_user.value,
      name: name.value,
      direction: direction.value,
      speed: speed.value,
      delay: delay.value,
    })
  }

  const clearSimulation = () => {
    localStorage.clear()

    try {
      socket.emit('leaveLine', {
        id_user: id_user.value,
      })
    } catch (error) {
      logError('Error al salir de la cola', ErrorSource.SOCKET, ErrorSeverity.WARNING, error)
    }

    id_user.value = ''
    name.value = ''
    direction.value = ''
    speed.value = 0
    delay.value = 0
    list_vehicles.value = []
    status.value = { state: 'En la cola' }
    shift.value = false
    show_form.value = true
  }

  const updateCrossing = (
    vehicles: ListVehicle[],
    active: boolean,
    animationData: ListVehicle | null,
    progressValue: number,
  ) => {
    list_vehicles.value = vehicles
    crossing.value = active
    progress.value = progressValue

    if (animationData) {
      animation_direction.value = animationData.data.direction
      if (animation_direction.value == 'Izquierda') {
        animation.value.animationDuration = animationData.time + 's'
        shift.value = animationData.id == id_user.value
      } else {
        animationInverse.value.animationDuration = animationData.time + 's'
        shift.value = animationData.id == id_user.value
      }
    }

    updateState()
  }

  const updateState = () => {
    if (shift.value) {
      status.value.state = 'Cruzando'
    } else {
      const position = list_vehicles.value.findIndex((vehicle) => vehicle.id === id_user.value)

      if (position !== -1) {
        status.value.state = `En la cola`
        myPosition.value = list_vehicles.value.findIndex((v) => v.id === id_user.value)
        myPosition.value = myPosition.value + 1
        countdown.value = 0
      } else {
        status.value.state = 'Esperando para volver a la cola'
        if (!time_process.value) {
          countdown.value = delay.value
          startCountdown()
        }
      }
    }
  }

  const startCountdown = () => {
    clearCountdown()

    time_process.value = true
    if (countdown.value <= 0) {
      countdown.value = delay.value
    }

    if (countdownInterval.value === null) {
      countdownInterval.value = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          time_process.value = false
          clearCountdown()
        }
      }, 1000)
    }
  }

  const clearCountdown = () => {
    if (countdownInterval.value !== null) {
      clearInterval(countdownInterval.value)
      countdownInterval.value = null
    }
  }

  // Manejo de reconexión
  const attemptReconnect = () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      clearReconnectInterval()
      notifyUser(
        'No se pudo reconectar al servidor después de varios intentos. Por favor, recargue la página.',
        ErrorSeverity.ERROR,
        0, // No desaparece automáticamente
      )
      return
    }

    isReconnecting.value = true
    reconnectAttempts.value++

    try {
      socket.connect()
      notifyUser(
        `Intentando reconectar... (Intento ${reconnectAttempts.value}/${maxReconnectAttempts})`,
        ErrorSeverity.INFO,
      )
    } catch (error) {
      logError(
        `Error en intento de reconexión ${reconnectAttempts.value}`,
        ErrorSource.SOCKET,
        ErrorSeverity.WARNING,
        error,
      )
    }
  }

  const clearReconnectInterval = () => {
    if (reconnectInterval.value !== null) {
      clearInterval(reconnectInterval.value)
      reconnectInterval.value = null
    }
  }

  const startReconnectProcess = () => {
    if (reconnectInterval.value === null && !isReconnecting.value) {
      reconnectAttempts.value = 0
      reconnectInterval.value = setInterval(attemptReconnect, 5000) // Intenta cada 5 segundos
      attemptReconnect() // Intenta inmediatamente la primera vez
    }
  }

  const handleConnectionSuccess = () => {
    isReconnecting.value = false
    reconnectAttempts.value = 0
    clearReconnectInterval()
    notifyConnectionStatus(true)

    // Si el usuario ya estaba en la simulación, reenvía los datos
    if (id_user.value && !show_form.value) {
      socket.emit('joinLine', {
        id_user: id_user.value,
        name: name.value,
        direction: direction.value,
        speed: speed.value,
        delay: delay.value,
      })
    }
  }

  const handleConnectionError = (error: any) => {
    logError('Error de conexión con el servidor', ErrorSource.SOCKET, ErrorSeverity.ERROR, error)
    notifyConnectionStatus(false)
    startReconnectProcess()
  }

  // Configuración de sockets y ciclo de vida
  const setupSockets = async () => {
    try {
      socket.connect()

      // Configurar manejadores de conexión
      socket.onConnect(handleConnectionSuccess)
      socket.onDisconnect(handleConnectionError)
      socket.onError(handleConnectionError)

      // Verificar si ya existe una sesión
      const hasExistingSession = await checkExistingSession()

      // Si no hay una sesión existente y hay datos en localStorage, los cargamos
      if (!hasExistingSession && localStorage.getItem('id_user')) {
        id_user.value = localStorage.getItem('id_user')!
        name.value = localStorage.getItem('name')!
        direction.value = localStorage.getItem('direction')!
        speed.value = parseInt(localStorage.getItem('speed')!)
        delay.value = parseInt(localStorage.getItem('delay')!)
      }

      // Configurar listeners de eventos
      socket.on(
        'dataLine',
        (data: {
          list_vehicles: ListVehicle[]
          crossing: boolean
          animation_crossing: ListVehicle | null
          progress: number
        }) => {
          try {
            updateCrossing(
              data.list_vehicles,
              data.crossing,
              data.animation_crossing,
              data.progress,
            )
            loading.value = false
            show_form.value = false
          } catch (error) {
            logError(
              'Error al procesar datos de la cola',
              ErrorSource.SIMULATION,
              ErrorSeverity.ERROR,
              error,
            )
          }
        },
      )

      socket.on('vehicleLine', (data: ListVehicle[]) => {
        try {
          list_vehicles.value = data
          loading.value = false
          show_form.value = false
          updateState()
        } catch (error) {
          logError(
            'Error al procesar lista de vehículos',
            ErrorSource.SIMULATION,
            ErrorSeverity.ERROR,
            error,
          )
        }
      })

      socket.on(
        'crossingEvent',
        (data: { list_vehicles: ListVehicle[]; crossing: ListVehicle; progress: number }) => {
          try {
            console.log('eduard')
            updateCrossing(data.list_vehicles, true, data.crossing, data.progress)
          } catch (error) {
            logError(
              'Error al procesar evento de cruce',
              ErrorSource.SIMULATION,
              ErrorSeverity.ERROR,
              error,
            )
          }
        },
      )

      socket.on('updateCrossing', (update_crossing: boolean) => {
        crossing.value = update_crossing
      })

      socket.on('UpdateState', () => {
        shift.value = false
        updateState()
      })

      socket.on('UpdateDirection', (data: { direction: string; id: string }) => {
        if (id_user.value == data.id) {
          direction.value = data.direction
          localStorage.setItem('direction', direction.value)
        }
      })

      // Manejar errores de socket
      socket.onError((error) => {
        logError(
          'Error en la comunicación con el servidor',
          ErrorSource.SOCKET,
          ErrorSeverity.ERROR,
          error,
        )
      })

      // Añadir listener para manejo de sesiones duplicadas
      socket.on('duplicateSession', () => {
        notifyUser(
          'Tu sesión ha sido cerrada porque se ha iniciado en otro dispositivo.',
          ErrorSeverity.WARNING,
        )
        clearSimulation()
      })
    } catch (error) {
      logError(
        'Error al configurar la conexión con el servidor',
        ErrorSource.SOCKET,
        ErrorSeverity.ERROR,
        error,
      )
      notifyUser('No se pudo establecer conexión con el servidor', ErrorSeverity.ERROR)
    }
  }

  onMounted(() => {
    setupSockets()
  })

  onUnmounted(() => {
    clearCountdown()
    clearReconnectInterval()
    socket.disconnect()
  })

  return {
    // Estado
    direction,
    speed,
    delay,
    show_form,
    name,
    status,
    shift,
    loading,
    id_user,
    crossing,
    list_vehicles,
    countdown,
    myPosition,
    animation,
    animationInverse,
    animation_direction,
    progress,
    hasConnectionError,
    isReconnecting,
    reconnectAttempts,

    // Métodos
    startSimulation,
    clearSimulation,
  }
}
