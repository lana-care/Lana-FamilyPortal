<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Shared documents</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
      <LucideFileText class="w-12 h-12 mx-auto mb-4 opacity-40" />
      <p>No documents have been shared with you yet.</p>
      <p class="mt-2 text-xs">Your care provider can publish reports and letters here when available.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText as LucideFileText } from 'lucide-vue-next'

definePageMeta({ layout: false })
</script>
