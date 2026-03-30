<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Calendar</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6">
      <p class="text-xs text-muted-foreground mb-4">Visit days this month (from your schedule)</p>
      <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-2">
        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <template v-for="(d, i) in daysInMonth" :key="i">
          <div
            class="aspect-square rounded border text-xs flex flex-col items-center justify-center p-0.5"
            :class="d.hasVisit ? 'bg-primary/15 border-primary/30 font-semibold' : 'border-transparent text-muted-foreground'"
          >
            {{ d.day }}
          </div>
        </template>
      </div>
      <p class="text-xs text-muted-foreground mt-6">
        <NuxtLink to="/schedule" class="text-primary underline">Open full schedule</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FamilyPortalVisit } from '~/composables/usePortalAuth'

definePageMeta({ layout: false })

const { portalData, fetchPortal, token } = usePortalAuth()

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const daysInMonthCount = new Date(year, month + 1, 0).getDate()
const firstDow = new Date(year, month, 1).getDay()
const pad = firstDow === 0 ? 6 : firstDow - 1

const visitDates = computed(() => {
  const set = new Set<string>()
  const add = (v: FamilyPortalVisit | undefined) => {
    if (!v?.date) return
    const datePart = String(v.date).split('T')[0] ?? ''
    const parts = datePart.split('-').map(Number)
    const y = parts[0]
    const m = parts[1]
    const d = parts[2]
    if (y === undefined || m === undefined || d === undefined) return
    if (y === year && m - 1 === month) set.add(String(d))
  }
  for (const v of portalData.value?.upcomingVisits || []) add(v as FamilyPortalVisit)
  for (const v of portalData.value?.recentVisits || []) add(v as FamilyPortalVisit)
  return set
})

const daysInMonth = computed(() => {
  const out: { day: number | ''; hasVisit: boolean }[] = []
  for (let i = 0; i < pad; i++) out.push({ day: '', hasVisit: false })
  for (let d = 1; d <= daysInMonthCount; d++) {
    out.push({ day: d, hasVisit: visitDates.value.has(String(d)) })
  }
  return out
})

onMounted(async () => {
  if (token.value && !portalData.value?.valid) await fetchPortal()
})
</script>
