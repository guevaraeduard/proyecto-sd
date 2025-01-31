<script setup lang="ts">
// ... existing code ...
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
    <!-- Contenido ad icional aquí -->
    <div class="flex items-center justify-center h-full">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
        <img
          src="../../public/img/avatar.png"
          alt="Imagen de perfil"
          class="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 class="text-xl font-semibold">Bienvenido</h2>
        <p class="text-gray-600">LLene el formulario para continuar</p>
      </div>
    </div>
  </div>
</template>
