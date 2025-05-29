export interface Session {
  id: number
  user_id: string
  title: string
  desc: string
  type: string
  varighet: number
  created_at: string
  users?: {
    name: string
  }
}

export interface SessionData {
  title: string
  desc: string
  type: string
  varighet: number
}

export const useSessions = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const { updatePoints } = useAuth()
  
  // Simple reactive state
  const recentSessions = useState<Session[]>('sessions.recent', () => [])
  const mySessions = useState<Session[]>('sessions.mine', () => [])
  const isLoading = useState<boolean>('sessions.loading', () => false)

  // Fetch recent sessions (last week, all users)
  const fetchRecentSessions = async () => {
    if (import.meta.server) return
    
    // Prevent multiple simultaneous fetches
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      
      const { data, error } = await (supabase as any)
        .from('sessions')
        .select('*, users(name)')
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching recent sessions:', error.message)
        // Don't clear existing data on error - just log it
        return
      }
      
      recentSessions.value = data || []
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
      // Keep existing data on network errors
    } finally {
      isLoading.value = false
    }
  }

  // Fetch user's own sessions
  const fetchMySessions = async () => {
    // Only run on client side
    if (import.meta.server) return
    
    if (!user.value?.id) {
      mySessions.value = []
      return
    }

    // Don't show loading for user sessions to avoid UI flicker
    try {
      const { data, error } = await (supabase as any)
        .from('sessions')
        .select('*, users(name)')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching my sessions:', error.message)
        return
      }
      
      mySessions.value = data || []
    } catch (error) {
      console.error('Error fetching my sessions:', error)
    }
  }

  // Add new session
  const addSession = async (sessionData: SessionData) => {
    if (!user.value?.id) {
      useNotification().show('Du må være logget inn for å legge til økt', 'error')
      return false
    }

    try {
      const { error } = await (supabase as any).from('sessions').insert([
        {
          user_id: user.value.id,
          title: sessionData.title,
          desc: sessionData.desc,
          type: sessionData.type,
          varighet: sessionData.varighet
        }
      ])
      
      if (error) {
        useNotification().show('Feil ved lagring av økt: ' + error.message, 'error')
        return false
      }

      // Add points and immediately refresh sessions
      await updatePoints(1)
      
      // Force immediate refresh for better UX
      await Promise.all([
        fetchRecentSessions(),
        fetchMySessions()
      ])
      
      useNotification().show('Økt lagt til!', 'success')
      return true
    } catch (error) {
      console.error('Error adding session:', error)
      useNotification().show('Feil ved lagring av økt', 'error')
      return false
    }
  }

  // Delete session by ID
  const deleteSession = async (sessionId: number) => {
    if (!user.value?.id) {
      useNotification().show('Du må være logget inn for å slette økt', 'error')
      return false
    }

    try {
      const { error } = await (supabase as any)
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.value.id) // Only allow deleting own sessions
      
      if (error) {
        useNotification().show('Feil ved sletting av økt: ' + error.message, 'error')
        return false
      }

      // Immediately refresh sessions for better UX
      await Promise.all([
        fetchRecentSessions(),
        fetchMySessions()
      ])
      
      useNotification().show('Økt slettet!', 'success')
      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      useNotification().show('Feil ved sletting av økt', 'error')
      return false
    }
  }

  // Utility functions for session display
  const getTypeBadge = (type: string) => {
    if (!type) return { class: 'annet', label: 'Annet' }
    
    switch (type.toLowerCase()) {
      case 'pilates':
        return { class: 'pilates', label: 'Pilates' }
      case 'vann':
        return { class: 'vann', label: 'Vann' }
      case 'styrke':
        return { class: 'styrke', label: 'Styrke' }
      default:
        return { class: 'annet', label: 'Annet' }
    }
  }

  const getDotClass = (type: string) => {
    if (!type) return 'annet'
    
    switch (type.toLowerCase()) {
      case 'pilates': return 'pilates'
      case 'vann': return 'vann'
      case 'styrke': return 'styrke'
      default: return 'annet'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    }

  const formatDuration = (varighet: number | string) => {
    if (!varighet) return ''
    return typeof varighet === 'number' ? `${varighet} min` : `${varighet}`
  }

  return {
    recentSessions: readonly(recentSessions),
    mySessions: readonly(mySessions),
    isLoading: readonly(isLoading),
    fetchRecentSessions,
    fetchMySessions,
    addSession,
    deleteSession,
    getTypeBadge,
    getDotClass,
    formatDate,
    formatDuration
  }
}
