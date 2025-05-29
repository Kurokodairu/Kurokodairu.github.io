export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const points = useState<number>('user.points', () => 0)
  const isLoggedIn = computed(() => !!user.value)
  
  // Track if we've loaded points for current user to prevent duplicate fetches
  const loadedUserId = useState<string | null>('user.loadedUserId', () => null)

  // Get user points from database
  const updatePointDisplay = async (userId?: string) => {
    // Only run on client side
    if (import.meta.server) return
    
    if (!userId && !user.value?.id) {
      points.value = 0
      return
    }
    
    const currentUserId = userId || user.value?.id
    if (!currentUserId) return

    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('points')
        .eq('id', currentUserId)
        .single()
      
      if (!error && data) {
        points.value = Number(data.points) || 0
      }
    } catch (error) {
      console.error('Error fetching points:', error)
      points.value = 0
    }
  }

  // Update points in database
  const updatePoints = async (change: number) => {
    if (!user.value?.id) {
      useNotification().show('Du må være logget inn for å oppdatere poeng', 'error')
      return
    }

    try {
      const currentPoints = points.value
      const newScore = currentPoints + change

      const { error } = await (supabase as any)
        .from('users')
        .update({ points: newScore })
        .eq('id', user.value.id)

      if (!error) {
        // Update local state immediately - no need to fetch from database
        points.value = newScore
        useNotification().show(
          change > 0 ? `+${change} poeng` : `${change} poeng`,
          change > 0 ? 'success' : 'warning'
        )
      } else {
        console.error('Error updating points:', error.message)
        useNotification().show('Feil ved oppdatering av poeng.', 'error')
      }
    } catch (error) {
      console.error('Error updating points:', error)
      useNotification().show('Feil ved oppdatering av poeng.', 'error')
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) {
        console.error('Login error:', error.message)
        useNotification().show('Login feil: ' + error.message, 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      useNotification().show('Login feil', 'error')
    }
  }

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error.message)
        useNotification().show('Logout feil: ' + error.message, 'error')
      } else {
        points.value = 0
        await navigateTo('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
      useNotification().show('Logout feil', 'error')
    }
  }

  // Watch for auth state changes
  watchEffect(() => {
    if (user.value?.id) {
      // Only fetch points if we haven't loaded them for this user yet
      if (loadedUserId.value !== user.value.id) {
        loadedUserId.value = user.value.id
        updatePointDisplay(user.value.id)
      }
    } else {
      // User logged out - clear everything
      points.value = 0
      loadedUserId.value = null
    }
  })

  return {
    user: readonly(user),
    points: readonly(points),
    isLoggedIn,
    updatePointDisplay,
    updatePoints,
    loginWithGoogle,
    logout
  }
}
