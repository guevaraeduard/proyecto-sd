<script setup lang="ts">
defineProps<{
    crossing: boolean
    animation_direction: string
    animation: { animationDuration: string; animationIterationCount: string }
    animationInverse: { animationDuration: string; animationIterationCount: string }
    shift: boolean
    progress: number
}>()
</script>

<template>
    <div class="bg-gray-200 p-10">
        <div class="relative" v-if="crossing">
            <template v-if="animation_direction == 'Derecha'">
                <div class="w-full" :style="animationInverse">
                    <img :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'" alt="Vehículo"
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
                    <img :src="shift ? '../../public/img/red.png' : '../../public/img/green.png'" alt="Vehículo"
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
</template>