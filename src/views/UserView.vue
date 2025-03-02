<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Status } from '@/types/status'
//import { socket } from '@/socket/socket'
import { uid } from 'uid'
import type { ListVehicle } from '@/types/listVehicle'
import { useSocketStore } from '@/socket/socket'

//Variables
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
// Agregar una variable para controlar el intervalo activo
const countdownInterval = ref<number | null>(null)

//Funciones
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
  progressValue: number
) => {
  list_vehicles.value = vehicles
  crossing.value = active
  progress.value = progressValue
  console.log(progress.value)
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
    // Limpiar el contador cuando estamos cruzando

  } else {
    const position = list_vehicles.value.findIndex(vehicle => vehicle.id === id_user.value)

    if (position !== -1) {
      status.value.state = `En la cola`
      myPosition.value = list_vehicles.value.findIndex(v => v.id === id_user.value)
      myPosition.value = myPosition.value + 1
      // Limpiar el contador si estamos en la cola

      countdown.value = 0
    } else {
      status.value.state = 'Esperando para volver a la cola'
      // Forzar la reinicialización del contador
      // Iniciar nuevo contador
      if (!time_process.value) {
        countdown.value = delay.value

        startCountdown()
      }
    }
  }
}

const startCountdown = () => {
  // Primero limpiamos cualquier intervalo existente
  clearCountdown()

  time_process.value = true
  // Verificar que tengamos un valor válido para contar
  if (countdown.value <= 0) {
    countdown.value = delay.value
  }

  // Crear nuevo intervalo solo si no hay uno activo
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

onMounted(() => {
  //localStorage.clear()
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

  socket.on('crossingEvent', (data: { list_vehicles: ListVehicle[]; crossing: ListVehicle; progress: number }) => {
    updateCrossing(data.list_vehicles, true, data.crossing, data.progress)
  })

  socket.on('updateCrossing', (update_crossing: boolean) => {
    crossing.value = update_crossing
  })

  socket.on('UpdateState', () => {
    shift.value = false
    updateState()
  })

  socket.on('UpdateDirection', (data: { direction: string, id: string }) => {

    if (id_user.value == data.id) {
      direction.value = data.direction
      localStorage.setItem('direction', direction.value)
    }

  })
})
</script>

<template>
  <div class="p-2 sm:p-6 md:p-10 overflow-auto max-h-screen" style="
      background-image: url('../../public/img/fondo.jpg');
      background-size: cover;
      background-position: center;
      height: 100vh;
    ">
    <template v-if="show_form">
      <!-- Contenido ad icional aquí -->
      <div class="md:flex items-center justify-center h-screen">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-xl">
          <div class="text-center">
            <img src="../../public/img/avatar.png" alt="Imagen de perfil" class="w-24 h-24 rounded-full mx-auto mb-4" />
            <h2 class="text-xl font-semibold">Bienvenido</h2>
            <p class="text-gray-600">LLene el formulario para continuar</p>
          </div>

          <div class="mt-4">
            <p class="text-gray-600 font-semibold">Nombre:</p>
            <el-input v-model="name" size="large" class="w-full mt-2" />
          </div>

          <div class="mt-4">
            <p class="text-gray-600 font-semibold">Elige la dirección de salida:</p>
            <el-radio-group v-model="direction" size="large" class="mt-2">
              <el-radio-button label="Izquierda" value="Izquierda" />
              <el-radio-button label="Derecha" value="Derecha" />
            </el-radio-group>
          </div>
          <div class="mt-4">
            <p class="text-gray-600 font-semibold">
              <el-tooltip>
                <template #content>
                  <p>
                    La velocidad del vehículo determina el tiempo que tarda en cruzar el puente.
                  </p>
                  <p>La velocidad mínima es de 10 km/h y la máxima es de 120 km/h.</p>
                </template>
                <el-icon>
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
              Velocidad del vehículo <small class="text-xs">(en km/h)</small>:
            </p>
            <el-input-number v-model="speed" :min="10" :max="120" controls-position="right" size="large"
              class="w-full mt-2" />
          </div>

          <div class="mt-4">
            <p class="text-gray-600 font-semibold">
              Tiempo de espera para la siguiente salida
              <small class="text-xs">(en segundos)</small>:
            </p>
            <el-input-number v-model="delay" :min="1" controls-position="right" size="large" class="w-full mt-2" />
          </div>

          <div class="mt-4">
            <el-button @click="startSimulation" type="primary" size="large" class="w-full" :disabled="loading">
              <span class="loading-circle" v-if="loading"></span>
              <span v-else>Continuar</span>
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="md:flex items-center justify-center h-screen">
        <div class="w-full max-w-7xl overflow-hidden">
          <div class="bg-gray-200 p-10">
            <div class="relative" v-if="crossing">
              <template v-if="animation_direction == 'Derecha'">
                <div class="w-full" :style="animationInverse">
                  <img :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'" alt="Mi vehiculo"
                    class="w-24 h-24 absolute transition-all duration-300"
                    :class="shift ? '' : 'transform scale-x-[-1]'" :style="{
                      top: '-60px',
                      left: `${100 - progress}%`,
                      transform: 'translateX(-30%)'
                    }" />
                </div>
              </template>
              <template v-else>
                <div class="w-full" :style="animation">
                  <img :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'" alt="Mi vehiculo"
                    class="w-24 h-24 absolute transition-all duration-300"
                    :class="shift ? 'transform scale-x-[-1]' : ''" :style="{
                      top: '-60px',
                      left: `${progress}%`,
                      transform: 'translateX(10%)'

                    }" />
                </div>
              </template>
            </div>

            <div class="flex justify-center mt-4">
              <div class="h-1 w-full bg-white border-dashed border-t-2"></div>
            </div>
            <div class="flex justify-between mt-4">
              <h4 class="text-gray-600 font-semibold">Izq</h4>

              <h4 class="text-gray-600 font-semibold">Longitud del puente: 100m</h4>
              <h4 class="text-gray-600 font-semibold">Der</h4>
            </div>
          </div>

          <div class="flex justify-between">
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
              <div class="text-center">
                <h2 class="text-lg font-semibold">Vehículos en la cola</h2>
                <div class="flex flex-wrap justify-between max-h-64 overflow-y-auto">
                  <template v-for="vehicle in list_vehicles" :key="vehicle.id">
                    <div class="me-2">
                      <img :src="vehicle.id == id_user
                        ? '../../public/img/red.png'
                        : '../../public/img/green.png'
                        " alt="Mi vehiculo" class="w-24 h-24 mx-auto"
                        :class="vehicle.id == id_user ? '' : 'transform scale-x-[-1]'" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
              <div class="text-center">
                <img src="../../public/img/avatar.png" alt="Imagen de perfil"
                  class="w-24 h-24 rounded-full mx-auto mb-4" />
                <h2 class="text-xl font-semibold">{{ name }}</h2>
              </div>
              <p class="text-gray-600">
                <span class="font-semibold">Estado del vehículo:</span> {{ status.state }}
              </p>
              <p class="text-gray-600">
                <span class="font-semibold">Dirección de salida:</span> {{ direction }}
              </p>
              <template v-if="status.state == 'Esperando para volver a la cola'">
                <p class="text-gray-600">
                  <span class="font-semibold">Tiempo para volver a la cola:</span> {{ countdown }} s
                </p>
              </template>

              <template v-if="status.state == 'En la cola'">
                <p class="text-gray-600"><span class="font-semibold">Posición en la cola:</span> {{ myPosition }}</p>

              </template>


              <p class="text-gray-600">
                <span class="font-semibold">Mi vehículo:</span>
                <img src="../../public/img/red.png" alt="Mi vehiculo" class="w-16 h-16 mx-auto" />
              </p>
              <button @click="clearSimulation" class="mt-4 bg-red-500 text-white p-2 rounded-md w-full cursor-pointer">
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style>
.loading-circle {
  width: 20px;
  /* Tamaño del círculo */
  height: 20px;
  /* Tamaño del círculo */
  border: 2px solid rgba(255, 255, 255, 0.3);
  /* Color del borde */
  border-top: 2px solid #3498db;
  /* Color del borde superior */
  border-radius: 50%;
  /* Hacerlo circular */
  animation: spin 1s linear infinite;
  /* Animación de giro */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    /* Comienza en 0 grados */
  }

  100% {
    transform: rotate(360deg);
    /* Gira 360 grados */
  }
}
</style>
