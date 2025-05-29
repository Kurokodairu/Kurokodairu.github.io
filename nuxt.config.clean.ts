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
    head: {
      title: 'My Shop - Wellness Shop',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Wellness shop for your fitness journey. Earn points and redeem rewards.' }
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
  
  // Modules
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-icon'
  ],
  
  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/',
      callback: '/',
      exclude: []
    }
  },
  
  // CSS
  css: [
    '~/assets/css/main.css'
  ]
})
