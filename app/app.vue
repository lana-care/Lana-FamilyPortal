<template>
  <div class="min-h-screen bg-background">
    <NuxtPage />
    <ClientOnly>
      <Toaster position="top-center" rich-colors />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
