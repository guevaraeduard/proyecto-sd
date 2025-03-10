<script setup lang="ts">
defineProps<{
    hasConnectionError: boolean
    isReconnecting: boolean
    reconnectAttempts: number
}>()
</script>

<template>
    <div v-if="hasConnectionError" class="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
        <div v-if="isReconnecting">
            <span class="font-bold">Reconectando...</span>
            Intento {{ reconnectAttempts }} - Se perdió la conexión con el servidor
            <span
                class="inline-block ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </div>
        <div v-else>
            <span class="font-bold">Error de conexión</span>
            No se pudo conectar al servidor. Por favor, recargue la página.
        </div>
    </div>
</template>