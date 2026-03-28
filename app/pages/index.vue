<template>
  <div class="min-h-screen bg-background">
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LucideHeart class="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 class="text-sm font-bold">Carerpoint Family Portal</h1>
            <p v-if="portalData?.familyMember" class="text-[10px] text-muted-foreground">
              Welcome, {{ portalData.familyMember.name || 'Family Member' }}
            </p>
          </div>
        </div>
        <nav v-if="portalData?.valid" class="flex flex-wrap gap-2 text-xs">
          <NuxtLink to="/schedule" class="text-primary hover:underline">Schedule</NuxtLink>
          <NuxtLink to="/documents" class="text-primary hover:underline">Documents</NuxtLink>
          <NuxtLink to="/feedback" class="text-primary hover:underline">Feedback</NuxtLink>
        </nav>
      </div>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>

    <div v-else-if="error" class="max-w-md mx-auto px-4 py-24 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <LucideShieldAlert class="w-8 h-8 text-destructive" />
      </div>
      <h2 class="text-lg font-bold mb-2">Access Denied</h2>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <NuxtLink to="/login" class="text-sm text-primary underline">Use access link</NuxtLink>
    </div>

    <div v-else-if="portalData?.valid" class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent class="pt-5 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
              {{ clientInitials }}
            </div>
            <div>
              <h2 class="text-lg font-bold">{{ clientName }}</h2>
              <Badge variant="secondary" class="text-[10px] mt-1">{{ String(portalData.client?.status || 'Active') }}</Badge>
            </div>
          </div>
          <div
            v-if="portalData.client?.medicalConditions || portalData.client?.allergies"
            class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
          >
            <div v-if="portalData.client?.medicalConditions">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Medical Conditions</p>
              <p class="mt-0.5">{{ formatList(portalData.client.medicalConditions) }}</p>
            </div>
            <div v-if="portalData.client?.allergies">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allergies</p>
              <p class="mt-0.5">{{ formatList(portalData.client.allergies) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-if="portalData.carePlan">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <LucideClipboardList class="w-4 h-4 text-primary" />
            Care Plan
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <p class="text-sm font-medium">{{ (portalData.carePlan as { title?: string }).title }}</p>
          <p v-if="(portalData.carePlan as { summary?: string }).summary" class="text-sm text-muted-foreground mt-1">
            {{ (portalData.carePlan as { summary?: string }).summary }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2 flex flex-row items-center justify-between">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <LucideCalendar class="w-4 h-4 text-primary" />
            Recent Visits (Last 7 Days)
          </CardTitle>
          <NuxtLink to="/schedule" class="text-xs text-primary hover:underline">View all</NuxtLink>
        </CardHeader>
        <CardContent class="pt-0">
          <div v-if="portalData.recentVisits?.length" class="space-y-2">
            <NuxtLink
              v-for="(visit, i) in portalData.recentVisits"
              :key="visit.id || i"
              :to="visit.id ? `/visits/${visit.id}` : '#'"
              class="flex items-start gap-3 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
              :class="{ 'pointer-events-none opacity-60': !visit.id }"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="visit.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'"
              >
                <LucideCheck v-if="visit.status === 'completed'" class="w-4 h-4 text-emerald-600" />
                <LucideClock v-else class="w-4 h-4 text-muted-foreground" />
              </div>
              <div class="flex-1 min-w-0 text-left">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ formatDate(visit.date) }}</span>
                  <Badge
                    variant="secondary"
                    class="text-[9px]"
                    :class="{
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300':
                        visit.status === 'completed',
                    }"
                  >
                    {{ visit.status }}
                  </Badge>
                </div>
                <p v-if="visit.mood" class="text-xs text-muted-foreground mt-0.5">
                  Mood: {{ moodLabel(String(visit.mood)) }}
                  <span v-if="visit.foodIntake"> · Food: {{ visit.foodIntake }}</span>
                </p>
                <p v-if="visit.notes" class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ visit.notes }}</p>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="text-sm text-muted-foreground italic py-4 text-center">No recent visits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <LucideMessageCircle class="w-4 h-4 text-primary" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <div v-if="portalData.messages?.length" class="space-y-2">
            <div
              v-for="msg in portalData.messages"
              :key="msg.id || msg.content"
              class="p-2.5 rounded-lg text-sm"
              :class="
                msg.direction === 'outbound'
                  ? 'bg-primary/5 border-l-2 border-primary'
                  : 'bg-muted/30 border-l-2 border-muted-foreground/30'
              "
            >
              <p>{{ msg.content }}</p>
              <p class="text-[10px] text-muted-foreground mt-1">{{ formatDateTime(msg.createdAt || msg.created_at || '') }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground italic py-4 text-center">No messages yet</p>
        </CardContent>
      </Card>
    </div>

    <footer class="border-t mt-8 py-6 text-center text-xs text-muted-foreground">
      <p>Carerpoint · Family Portal</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Heart as LucideHeart,
  ShieldAlert as LucideShieldAlert,
  ClipboardList as LucideClipboardList,
  Calendar as LucideCalendar,
  Check as LucideCheck,
  Clock as LucideClock,
  MessageCircle as LucideMessageCircle,
} from 'lucide-vue-next'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)

const { token, portalData, fetchPortal, setToken } = usePortalAuth()

const clientName = computed(() => {
  if (!portalData.value?.client) return ''
  const c = portalData.value.client as { preferredName?: string; firstName?: string; lastName?: string }
  return c.preferredName || `${c.firstName || ''} ${c.lastName || ''}`.trim()
})

const clientInitials = computed(() => {
  if (!portalData.value?.client) return '?'
  const c = portalData.value.client as { firstName?: string; lastName?: string }
  return `${(c.firstName || '').charAt(0)}${(c.lastName || '').charAt(0)}`.toUpperCase()
})

function formatList(val: unknown) {
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'string') return val
  return ''
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDateTime(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function moodLabel(mood: string) {
  const map: Record<string, string> = {
    happy: '😊 Happy',
    neutral: '😐 Neutral',
    sad: '😢 Sad',
    anxious: '😰 Anxious',
    confused: '😕 Confused',
  }
  return map[mood] || mood
}

onMounted(async () => {
  const qToken = route.query.token as string | undefined
  if (qToken) {
    setToken(qToken)
    await fetchPortal(qToken)
    await router.replace({ path: '/', query: {} })
  } else if (token.value) {
    await fetchPortal()
  } else {
    error.value = 'No access token. Open the link from your email or sign in below.'
  }

  if (portalData.value && !portalData.value.valid) {
    error.value = portalData.value.error || 'Invalid session.'
  } else if (portalData.value?.valid) {
    error.value = null
  }
  loading.value = false
})
</script>
