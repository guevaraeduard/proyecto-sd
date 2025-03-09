import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Status } from '@/types/status'
import { uid } from 'uid'
import type { ListVehicle } from '@/types/listVehicle'
import { useSocketStore } from '@/socket/socket'

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

  // Funciones
  const startSimulation = () => {
    if (!speed.value || !delay.value || !name.value || !direction.value) {
      ElMessage({
        message: 'Por favor, complete todos los campos.',
        type: 'error',
        grouping: true,
      })
      return
    }

    if (!id_user.value) {
      id_user.value = uid()
      localStorage.setItem('id_user', id_user.value)
      localStorage.setItem('name', name.value)
      localStorage.setItem('direction', direction.value)
      localStorage.setItem('speed', speed.value.toString())
      localStorage.setItem('delay', delay.value.toString())
    }

    loading.value = true
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

    socket.emit('leaveLine', {
      id_user: id_user.value,
    })

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

  // Configuración de sockets y ciclo de vida
  const setupSockets = () => {
    socket.connect()

    if (localStorage.getItem('id_user')) {
      id_user.value = localStorage.getItem('id_user')!
      name.value = localStorage.getItem('name')!
      direction.value = localStorage.getItem('direction')!
      speed.value = parseInt(localStorage.getItem('speed')!)
      delay.value = parseInt(localStorage.getItem('delay')!)
      startSimulation()
    }

    socket.on(
      'dataLine',
      (data: {
        list_vehicles: ListVehicle[]
        crossing: boolean
        animation_crossing: ListVehicle | null
        progress: number
      }) => {
        updateCrossing(data.list_vehicles, data.crossing, data.animation_crossing, data.progress)
        loading.value = false
        show_form.value = false
      },
    )

    socket.on('vehicleLine', (data: ListVehicle[]) => {
      list_vehicles.value = data
      loading.value = false
      show_form.value = false
      updateState()
    })

    socket.on(
      'crossingEvent',
      (data: { list_vehicles: ListVehicle[]; crossing: ListVehicle; progress: number }) => {
        updateCrossing(data.list_vehicles, true, data.crossing, data.progress)
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
  }

  onMounted(() => {
    setupSockets()
  })

  onUnmounted(() => {
    clearCountdown()
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

    // Métodos
    startSimulation,
    clearSimulation,
  }
}
