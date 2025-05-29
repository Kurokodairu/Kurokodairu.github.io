export default defineNuxtPlugin(async () => {
  // This plugin is automatically handled by @nuxtjs/supabase
  // We can add custom initialization here if needed
  
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Optional: Add global error handling for Supabase
  if (process.client) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any cached data when user signs out
        clearNuxtData()
      }
    })
  }
})
