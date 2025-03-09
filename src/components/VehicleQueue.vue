<script setup lang="ts">
import type { ListVehicle } from '@/types/listVehicle'

defineProps<{
    list_vehicles: ListVehicle[]
    id_user: string
}>()
</script>

<template>
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mt-4">
        <div class="text-center">
            <h2 class="text-lg font-semibold">Vehículos en la cola</h2>
            <div class="flex flex-wrap justify-between max-h-64 overflow-y-auto">
                <template v-for="vehicle in list_vehicles" :key="vehicle.id">
                    <div class="me-2">
                        <img :src="vehicle.id == id_user ? '../../public/img/red.png' : '../../public/img/green.png'"
                            alt="Vehículo" class="w-24 h-24 mx-auto"
                            :class="vehicle.id == id_user ? '' : 'transform scale-x-[-1]'" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>