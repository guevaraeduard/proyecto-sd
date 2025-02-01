<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Status } from '@/types/status'
//Variables
const direction = ref('Izquierda')
const speed = ref(0)
const delay = ref(0)
const show_form = ref(true)
const name = ref('')
const status = ref<Status>({ state: 'En espera' })
//Funciones
const startSimulation = () => {
  if (!speed.value || !delay.value || !name.value) {
    ElMessage({
      message: 'Por favor, complete todos los campos.',
      type: 'error',
      grouping: true,
    })
    return
  }
  show_form.value = false
  //Aqui mandar los datos al socket
}
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
              Velocidad del vehículo <small class="text-xs">(en km/h)</small>:
            </p>
            <el-input-number
              v-model="speed"
              :min="1"
              :max="200"
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
            <el-button @click="startSimulation" type="primary" size="large" class="w-full"
              >Continuar</el-button
            >
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-center h-full">
        <div class="w-full max-w-7xl">
          <div class="bg-gray-200 p-8">
            <div class="flex justify-between mt-4">
              <div class="bg-gray-600 h-8 w-8 rounded-full"></div>
              <div class="bg-gray-600 h-8 w-8 rounded-full"></div>
            </div>
            <div class="flex justify-center mt-4">
              <div class="h-1 w-full bg-white border-dashed border-t-2"></div>
            </div>
            <div class="flex justify-between mt-4">
              <h4 class="text-gray-600 font-semibold">Izq</h4>

              <h4 class="text-gray-600 font-semibold">Longitud del puente: 10Km</h4>
              <h4 class="text-gray-600 font-semibold">Der</h4>
            </div>
          </div>

          <div class="flex justify-between">
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
              <div class="text-center">
                <h2 class="text-lg font-semibold">Vehículos en la cola</h2>
                <div class="flex flex-wrap justify-between max-h-64 overflow-y-auto">
                  <div class="me-2">
                    <img
                      src="../../public/img/red.png"
                      alt="Mi vehiculo"
                      class="w-24 h-24 mx-auto"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
                  <div class="me-2">
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>

                  <div>
                    <img
                      src="../../public/img/green.png"
                      alt="vehiculo en cola"
                      class="w-24 h-24 mx-auto transform scale-x-[-1]"
                    />
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
