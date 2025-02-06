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
const status = ref<Status>({ state: 'En espera' })
const shift = ref(false)
const loading = ref(false)
const id_user = ref('')
const crossing = ref(false)
const list_vehicles = ref<ListVehicle[]>([])
const animation = ref({
  animationDuration: '10s',
  animationIterationCount: 'infinite',
  animationName: 'moveCar',
})

const animationInverse = ref({
  animationDuration: '10s',
  animationIterationCount: 'infinite',
  animationName: 'moveCarInverse',
})

const socket = useSocketStore()

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
  status.value = { state: 'En espera' }
  shift.value = false
  show_form.value = true
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

  socket.on('dataLine', (data: { list_vehicles: ListVehicle[]; crossing: boolean }) => {
    list_vehicles.value = data.list_vehicles
    crossing.value = data.crossing
    loading.value = false
    show_form.value = false
    console.log(data)
  })

  socket.on('vehicleLine', (data: ListVehicle[]) => {
    console.log('Datos recibidos de vehicleLine:', data)
    list_vehicles.value = data
    loading.value = false
    show_form.value = false
  })

  socket.on('crossingEvent', (data: { list_vehicles: ListVehicle[]; crossing: ListVehicle }) => {
    list_vehicles.value = data.list_vehicles
    if (data.crossing.data.direction == 'Izquierda') {
      animation.value.animationDuration = data.crossing.time + 's'
      shift.value = data.crossing.id == id_user.value
    } else {
      animationInverse.value.animationDuration = data.crossing.time + 's'
      shift.value = data.crossing.id == id_user.value
    }
    crossing.value = true
    console.log('Datos recibidos de crossingEvent:', data.crossing)
  })

  socket.on('updateCrossing', (update_crossing: boolean) => {
    crossing.value = update_crossing
  })
})
</script>

<template>
  <div
    style="
      background-image: url('../../public/img/fondo.jpg');
      background-size: cover;
      background-position: center;
      height: 100vh;
    "
  >
    <template v-if="show_form">
      <!-- Contenido ad icional aquí -->
      <div class="flex items-center justify-center h-full">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-xl">
          <div class="text-center">
            <img
              src="../../public/img/avatar.png"
              alt="Imagen de perfil"
              class="w-24 h-24 rounded-full mx-auto mb-4"
            />
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
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
              Velocidad del vehículo <small class="text-xs">(en km/h)</small>:
            </p>
            <el-input-number
              v-model="speed"
              :min="10"
              :max="120"
              controls-position="right"
              size="large"
              class="w-full mt-2"
            />
          </div>

          <div class="mt-4">
            <p class="text-gray-600 font-semibold">
              Tiempo de espera para la siguiente salida
              <small class="text-xs">(en segundos)</small>:
            </p>
            <el-input-number
              v-model="delay"
              :min="1"
              controls-position="right"
              size="large"
              class="w-full mt-2"
            />
          </div>

          <div class="mt-4">
            <el-button
              @click="startSimulation"
              type="primary"
              size="large"
              class="w-full"
              :disabled="loading"
            >
              <span class="loading-circle" v-if="loading"></span>
              <span v-else>Continuar</span>
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-center h-full">
        <div class="w-full max-w-7xl overflow-hidden">
          <div class="bg-gray-200 p-10">
            <div class="relative" v-if="crossing">
              <template v-if="direction == 'Derecha'">
                <div class="w-full" :style="animationInverse">
                  <img
                    :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'"
                    alt="Mi vehiculo"
                    class="w-24 h-24 absolute"
                    :class="shift ? '' : 'transform scale-x-[-1]'"
                    style="top: -60px; left: 0"
                  />
                </div>
              </template>
              <template v-else>
                <div class="w-full" :style="animation">
                  <img
                    :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'"
                    alt="Mi vehiculo"
                    class="w-24 h-24 absolute"
                    :class="shift ? 'transform scale-x-[-1]' : ''"
                    style="top: -60px; left: 0"
                  />
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
                      <img
                        :src="
                          vehicle.id == id_user
                            ? '../../public/img/red.png'
                            : '../../public/img/green.png'
                        "
                        alt="Mi vehiculo"
                        class="w-24 h-24 mx-auto"
                        :class="vehicle.id == id_user ? '' : 'transform scale-x-[-1]'"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
              <div class="text-center">
                <img
                  src="../../public/img/avatar.png"
                  alt="Imagen de perfil"
                  class="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 class="text-xl font-semibold">{{ name }}</h2>
              </div>
              <p class="text-gray-600">
                <span class="font-semibold">Estado del vehículo:</span> {{ status.state }}
              </p>
              <p class="text-gray-600">
                <span class="font-semibold">Dirección de salida:</span> {{ direction }}
              </p>
              <p class="text-gray-600">
                <span class="font-semibold">Tiempo para volver a la cola:</span> {{ delay }} s
              </p>
              <p class="text-gray-600"><span class="font-semibold">Posición en la cola:</span> 1</p>
              <p class="text-gray-600">
                <span class="font-semibold">Mi vehículo:</span>
                <img src="../../public/img/red.png" alt="Mi vehiculo" class="w-16 h-16 mx-auto" />
              </p>
              <button
                @click="clearSimulation"
                class="mt-4 bg-red-500 text-white p-2 rounded-md w-full cursor-pointer"
              >
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
@keyframes moveCar {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(25%);
  }
  50% {
    transform: translateX(50%);
  }
  75% {
    transform: translateX(75%);
  }
  100% {
    transform: translateX(95%); /* Mueve el carro a través del ancho del puente */
  }
}

@keyframes moveCarInverse {
  0% {
    transform: translateX(95%);
  }
  25% {
    transform: translateX(75%);
  }
  50% {
    transform: translateX(50%);
  }
  75% {
    transform: translateX(25%);
  }

  100% {
    transform: translateX(0); /* Mueve el carro a través del ancho del puente */
  }
}

.loading-circle {
  width: 20px; /* Tamaño del círculo */
  height: 20px; /* Tamaño del círculo */
  border: 2px solid rgba(255, 255, 255, 0.3); /* Color del borde */
  border-top: 2px solid #3498db; /* Color del borde superior */
  border-radius: 50%; /* Hacerlo circular */
  animation: spin 1s linear infinite; /* Animación de giro */
}

@keyframes spin {
  0% {
    transform: rotate(0deg); /* Comienza en 0 grados */
  }
  100% {
    transform: rotate(360deg); /* Gira 360 grados */
  }
}
</style>
