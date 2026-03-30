<script setup lang="ts">
import { computed } from 'vue'

/**
 * Minimal month grid (shadcn-style) — day numbers with optional highlight for visit days.
 */
const props = withDefaults(
  defineProps<{
    year: number
    month: number
    /** Day-of-month numbers (1–31) to highlight */
    markedDays?: Set<number> | number[]
  }>(),
  {
    markedDays: () => new Set<number>(),
  },
)

const marked = computed(() => {
  const m = props.markedDays
  if (m instanceof Set) return m
  return new Set(m)
})

const firstDow = computed(() => {
  const d = new Date(props.year, props.month, 1).getDay()
  return d === 0 ? 6 : d - 1
})

const daysInMonth = computed(() => new Date(props.year, props.month + 1, 0).getDate())

const pad = computed(() => firstDow.value)

const label = computed(() =>
  new Date(props.year, props.month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
)
</script>

<template>
  <div class="rounded-xl border bg-card p-4 shadow-sm">
    <p class="text-sm font-semibold text-foreground mb-3">{{ label }}</p>
    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground mb-2">
      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <template v-for="i in pad" :key="'p' + i">
        <div />
      </template>
      <div
        v-for="d in daysInMonth"
        :key="d"
        class="aspect-square flex items-center justify-center rounded-md text-xs tabular-nums"
        :class="
          marked.has(d)
            ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
            : 'text-muted-foreground hover:bg-muted/80'
        "
      >
        {{ d }}
      </div>
    </div>
  </div>
</template>
