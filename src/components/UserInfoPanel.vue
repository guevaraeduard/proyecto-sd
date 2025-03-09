<script setup lang="ts">
import type { Status } from '@/types/status'

defineProps<{
    name: string
    status: Status
    direction: string
    countdown: number
    myPosition: number
}>()

const emit = defineEmits<{
    (e: 'exit'): void
}>()
</script>

<template>
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
        <div class="text-center">
            <img src="../../public/img/avatar.png" alt="Imagen de perfil" class="w-24 h-24 rounded-full mx-auto mb-4" />
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
            <p class="text-gray-600">
                <span class="font-semibold">Posición en la cola:</span> {{ myPosition }}
            </p>
        </template>

        <p class="text-gray-600">
            <span class="font-semibold">Mi vehículo:</span>
            <img src="../../public/img/red.png" alt="Mi vehiculo" class="w-16 h-16 mx-auto" />
        </p>

        <button @click="emit('exit')" class="mt-4 bg-red-500 text-white p-2 rounded-md w-full cursor-pointer">
            Salir
        </button>
    </div>
</template>