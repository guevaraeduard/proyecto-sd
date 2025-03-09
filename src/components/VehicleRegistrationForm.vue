<script setup lang="ts">
import { ElInput, ElInputNumber, ElRadioGroup, ElRadioButton, ElButton, ElTooltip, ElIcon } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

defineProps<{
    name: string
    direction: string
    speed: number
    delay: number
    loading: boolean
}>()

const emit = defineEmits<{
    (e: 'update:name', value: string): void
    (e: 'update:direction', value: string): void
    (e: 'update:speed', value: number): void
    (e: 'update:delay', value: number): void
    (e: 'submit'): void
}>()
</script>

<template>
    <div class="md:flex items-center justify-center h-screen">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-xl">
            <div class="text-center">
                <img src="../../public/img/avatar.png" alt="Imagen de perfil"
                    class="w-24 h-24 rounded-full mx-auto mb-4" />
                <h2 class="text-xl font-semibold">Bienvenido</h2>
                <p class="text-gray-600">LLene el formulario para continuar</p>
            </div>

            <div class="mt-4">
                <p class="text-gray-600 font-semibold">Nombre:</p>
                <el-input :model-value="name" @update:model-value="emit('update:name', $event)" size="large"
                    class="w-full mt-2" />
            </div>

            <div class="mt-4">
                <p class="text-gray-600 font-semibold">Elige la dirección de salida:</p>
                <el-radio-group :model-value="direction" @update:model-value="emit('update:direction', $event)"
                    size="large" class="mt-2">
                    <el-radio-button label="Izquierda" value="Izquierda" />
                    <el-radio-button label="Derecha" value="Derecha" />
                </el-radio-group>
            </div>

            <div class="mt-4">
                <p class="text-gray-600 font-semibold">
                    <el-tooltip>
                        <template #content>
                            <p>La velocidad del vehículo determina el tiempo que tarda en cruzar el puente.</p>
                            <p>La velocidad mínima es de 10 km/h y la máxima es de 120 km/h.</p>
                        </template>
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                    Velocidad del vehículo <small class="text-xs">(en km/h)</small>:
                </p>
                <el-input-number :model-value="speed" @update:model-value="emit('update:speed', $event)" :min="10"
                    :max="120" controls-position="right" size="large" class="w-full mt-2" />
            </div>

            <div class="mt-4">
                <p class="text-gray-600 font-semibold">
                    Tiempo de espera para la siguiente salida
                    <small class="text-xs">(en segundos)</small>:
                </p>
                <el-input-number :model-value="delay" @update:model-value="emit('update:delay', $event)" :min="1"
                    controls-position="right" size="large" class="w-full mt-2" />
            </div>

            <div class="mt-4">
                <el-button @click="emit('submit')" type="primary" size="large" class="w-full" :disabled="loading">
                    <span class="loading-circle" v-if="loading"></span>
                    <span v-else>Continuar</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading-circle {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>