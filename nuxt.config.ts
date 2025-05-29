export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-05-26',
  
  // Static site generation for GitHub Pages
  nitro: {
    prerender: {
      routes: ['/']
    },
    output: {
      dir: 'docs',
      publicDir: 'docs'
    }
  },
  
  // App configuration
  app: {
    baseURL: '/',
    buildAssetsDir: '/assets/',
    cdnURL: '',
    head: {
      title: 'LOGG',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Treningslogg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icon/favicon.ico' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/lucide-static@0.260.0/font/lucide.css' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.24.0/dist/umd/supabase.js' }
      ]
    }
  },
  
  // Runtime config for Supabase
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_SUPABASE_ANON_KEY || process.env.NUXT_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
    }
  },
  
  // Modules
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-icon'
  ],
  
  // Supabase configuration
  supabase: {
    url: process.env.NUXT_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.NUXT_SUPABASE_ANON_KEY || process.env.NUXT_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/',
      callback: '/',
      exclude: []
    }
  },
  
  // CSS
  css: [
    '~/assets/css/main.css'
  ],
  
  // Client-side rendering to prevent SSR issues
  ssr: false
})