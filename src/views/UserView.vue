<script setup lang="ts">
import { ref } from 'vue';
const direction = ref('Izquierda')
const speed = ref(0)
const delay = ref(0)
</script>

<template>
  <div style="
      background-image: url('../../public/img/fondo.jpg');
      background-size: cover;
      background-position: center;
      height: 100vh;
    ">
    <!-- Contenido ad icional aquí -->
    <div class="flex items-center justify-center h-full">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-xl">
        <div class="text-center">
          <img src="../../public/img/avatar.png" alt="Imagen de perfil" class="w-24 h-24 rounded-full mx-auto mb-4" />
          <h2 class="text-xl font-semibold">Bienvenido</h2>
          <p class="text-gray-600">LLene el formulario para continuar</p>
        </div>

        <div class="mt-4">
          <p for="" class="text-gray-600 font-semibold">Elige la dirección de salida:</p>
          <el-radio-group v-model="direction" size="large" class="mt-2">
            <el-radio-button label="Izquierda" value="Izquierda" />
            <el-radio-button label="Derecha" value="Derecha" />
          </el-radio-group>
        </div>
        <div class="mt-4">
          <p for="" class="text-gray-600 font-semibold">Velocidad del vehículo <small class="text-xs">(en km/h)</small>:</p>
          <el-input-number v-model="speed" :min="1" :max="200" controls-position="right" size="large" class="w-full mt-2" />
        </div>

        <div class="mt-4">
          <p for="" class="text-gray-600 font-semibold">Tiempo de espera para la siguiente salida <small class="text-xs">(en segundos)</small>:</p>
          <el-input-number v-model="delay" :min="1" controls-position="right" size="large" class="w-full mt-2" />
        </div>

        <div class="mt-4">
          <el-button type="primary" size="large" class="w-full">Continuar</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
