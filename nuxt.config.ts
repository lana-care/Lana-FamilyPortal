// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',
  ssr: true,
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  devServer: {
    port: 3003,
    host: 'localhost',
  },

  modules: ['@nuxtjs/supabase', '@nuxtjs/i18n', '@vueuse/nuxt', '@nuxt/eslint', 'shadcn-nuxt', '@pinia/nuxt'],

  i18n: {
    locales: [
      { code: 'en', iso: 'en', name: 'English', file: 'en.json', lang: 'en' },
      { code: 'fr', iso: 'fr', name: 'Français', file: 'fr.json', lang: 'fr' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: false,
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'carerpoint_family_i18n',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY ?? process.env.SUPABASE_KEY ?? '',
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/login',
      exclude: ['/', '/login', '/schedule', '/documents', '/feedback', '/visits/*'],
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000',
      appName: 'Carerpoint Family Portal',
      appVersion: 'v1.1',
    },
  },

  app: {
    head: {
      title: 'Carerpoint — Family Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Family portal for home care' },
        { name: 'theme-color', content: '#1e5cab' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/ia_icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
    pageTransition: { name: 'page-slide', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  vite: {
    ssr: {
      external: [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
        '@vue/server-renderer',
      ],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      minify: 'esbuild',
    },
  },
})
