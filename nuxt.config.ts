export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-05-26',

  nitro: {
    preset: 'github-pages',
    prerender: {
      routes: ['/']
    }
  },

  app: {
    baseURL: '/',
    buildAssetsDir: '/assets/',
    head: {
      title: 'LOGG',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Treningslogg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icon/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // Prefer standard NUXT_PUBLIC_* variables, but keep backwards-compat fallbacks
      supabaseUrl:
        process.env.NUXT_PUBLIC_SUPABASE_URL ||
        process.env.NUXT_SUPABASE_URL ||
        process.env.SUPABASE_URL,
      supabaseKey:
        process.env.NUXT_PUBLIC_SUPABASE_KEY ||
        process.env.NUXT_SUPABASE_ANON_KEY ||
        process.env.NUXT_SUPABASE_KEY ||
        process.env.SUPABASE_ANON_KEY
    }
  },

  modules: [
    '@nuxtjs/supabase',
    'nuxt-icon'
  ],

  supabase: {
    redirectOptions: { login: '/', callback: '/', exclude: [] },
    // Read config from runtimeConfig.public so we can source from .env
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NUXT_SUPABASE_URL,
    key:
      process.env.NUXT_PUBLIC_SUPABASE_KEY ||
      process.env.NUXT_SUPABASE_ANON_KEY ||
      process.env.NUXT_SUPABASE_KEY
  },

  css: ['~/assets/css/main.css'],

  ssr: false
})