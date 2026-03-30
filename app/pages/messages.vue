<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Messages</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div v-if="!token" class="text-sm text-muted-foreground text-center py-12">
        <NuxtLink to="/login" class="text-primary underline">Sign in with your access link</NuxtLink>
      </div>
      <template v-else>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(m, i) in thread"
            :key="m.id || i"
            class="rounded-lg border p-3 text-sm"
            :class="m.direction === 'inbound' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'"
          >
            <p class="text-xs text-muted-foreground mb-1 capitalize">{{ m.direction || 'message' }}</p>
            <p class="whitespace-pre-wrap">{{ m.content }}</p>
            <p v-if="m.created_at" class="text-[10px] text-muted-foreground mt-2">
              {{ formatDt(m.created_at) }}
            </p>
          </div>
          <div v-if="!thread.length" class="text-sm text-muted-foreground text-center py-8">
            No messages yet.
          </div>
        </div>
        <div class="pt-4 border-t space-y-2">
          <label class="text-xs font-medium text-muted-foreground">Message the agency</label>
          <textarea
            v-model="draft"
            rows="3"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Type your message…"
          />
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            :disabled="sending || !draft.trim()"
            @click="send"
          >
            {{ sending ? 'Sending…' : 'Send' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io, type Socket } from 'socket.io-client'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const { token, fetchPortal, portalData } = usePortalAuth()

const loading = ref(true)
const sending = ref(false)
const draft = ref('')
const thread = ref<Array<{ id?: string; content?: string; direction?: string; created_at?: string }>>([])

let socket: Socket | null = null

function formatDt(s: string) {
  try {
    return new Date(s).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

function mergeMessage(row: {
  id?: string
  content?: string
  direction?: string
  created_at?: string
}) {
  if (!row?.id && !row?.content) return
  const exists = thread.value.some((m) => row.id && m.id === row.id)
  if (exists) return
  thread.value = [...thread.value, row]
}

async function load() {
  if (!token.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ valid?: boolean; messages?: typeof thread.value }>(
      `${base}/api/v1/family-portal/messages?token=${encodeURIComponent(token.value)}`,
    )
    if (res?.valid && Array.isArray(res.messages)) {
      thread.value = res.messages
    } else {
      await fetchPortal()
      thread.value = (portalData.value?.messages as typeof thread.value) || []
    }
  } catch (e: unknown) {
    thread.value = []
    const err = e as { data?: { message?: string }; message?: string }
    toast.error(err?.data?.message || err?.message || 'Could not load messages.')
  } finally {
    loading.value = false
  }
}

function connectSocket() {
  socket?.disconnect()
  socket = null
  const tok = token.value
  if (!tok) return
  const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
  socket = io(`${base}/ws`, {
    path: '/socket.io',
    auth: { portalToken: tok },
    transports: ['websocket', 'polling'],
  })
  socket.on('family_message:new', (row: unknown) => {
    const r = row as { id?: string; content?: string; direction?: string; created_at?: string }
    mergeMessage(r)
  })
  socket.on('connect_error', (err) => {
    console.warn('[Family portal WS]', err.message)
  })
}

async function send() {
  if (!token.value || !draft.value.trim()) return
  sending.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ success?: boolean; error?: string }>(
      `${base}/api/v1/family-portal/messages?token=${encodeURIComponent(token.value)}`,
      {
        method: 'POST',
        body: { message: draft.value.trim() },
      },
    )
    if (!res?.success) {
      toast.error(res?.error || 'Could not send message.')
      return
    }
    draft.value = ''
    await load()
    await fetchPortal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    toast.error(err?.data?.message || err?.message || 'Could not send message.')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  void load().then(() => {
    connectSocket()
  })
})

onBeforeUnmount(() => {
  socket?.disconnect()
  socket = null
})
</script>
