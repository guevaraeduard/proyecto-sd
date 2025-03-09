<script setup lang="ts">
import { useVehicleSimulation } from '@/composables/useVehicleSimulation'
import VehicleRegistrationForm from '@/components/VehicleRegistrationForm.vue'
import BridgeSimulation from '@/components/BridgeSimulation.vue'
import VehicleQueue from '@/components/VehicleQueue.vue'
import UserInfoPanel from '@/components/UserInfoPanel.vue'

const {
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
  startSimulation,
  clearSimulation
} = useVehicleSimulation()
</script>

<template>
  <div class="p-2 sm:p-6 md:p-10 overflow-auto max-h-screen" style="
      background-image: url('../../public/img/fondo.jpg');
      background-size: cover;
      background-position: center;
      height: 100vh;
    ">
    <template v-if="show_form">
      <VehicleRegistrationForm v-model:name="name" v-model:direction="direction" v-model:speed="speed"
        v-model:delay="delay" :loading="loading" @submit="startSimulation" />
    </template>
    <template v-else>
      <div class="md:flex items-center justify-center h-screen">
        <div class="w-full max-w-7xl overflow-hidden">
          <!-- Componente de simulación del puente -->
          <BridgeSimulation :crossing="crossing" :animation_direction="animation_direction" :animation="animation"
            :animationInverse="animationInverse" :shift="shift" :progress="progress" />

          <div class="flex justify-between">
            <!-- Componente de cola de vehículos -->
            <VehicleQueue :list_vehicles="list_vehicles" :id_user="id_user" />

            <!-- Componente de información del usuario -->
            <UserInfoPanel :name="name" :status="status" :direction="direction" :countdown="countdown"
              :myPosition="myPosition" @exit="clearSimulation" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
