<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Visit detail</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <Card v-else-if="visit">
        <CardHeader>
          <CardTitle class="text-base">{{ formatDate(visit.date) }}</CardTitle>
          <Badge>{{ visit.status }}</Badge>
        </CardHeader>
        <CardContent class="space-y-3 text-sm">
          <p v-if="visit.start || visit.end" class="text-muted-foreground">
            {{ visit.start || '—' }} – {{ visit.end || '—' }}
          </p>
          <div v-if="visit.mood">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Mood</span>
            <p>{{ visit.mood }}</p>
          </div>
          <div v-if="visit.foodIntake">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Food</span>
            <p>{{ visit.foodIntake }}</p>
          </div>
          <div v-if="visit.notes">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Notes</span>
            <p class="whitespace-pre-wrap">{{ visit.notes }}</p>
          </div>
        </CardContent>
      </Card>
      <p v-else class="text-sm text-muted-foreground text-center py-12">Visit not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'

definePageMeta({ layout: false })

const route = useRoute()
const { token, portalData, fetchPortal } = usePortalAuth()
const loading = ref(true)
const visit = ref<FamilyPortalVisit | null>(null)

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(async () => {
  const id = route.params.id as string
  if (token.value && !portalData.value?.valid) {
    await fetchPortal()
  }
  const all = [
    ...(portalData.value?.recentVisits || []),
    ...(portalData.value?.upcomingVisits || []),
  ] as FamilyPortalVisit[]
  visit.value = all.find((v) => v.id === id) || null
  loading.value = false
})
</script>
