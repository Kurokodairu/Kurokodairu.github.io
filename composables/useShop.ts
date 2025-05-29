export interface ShopItem {
  id?: number
  title: string
  description: string
  points: number
  image: string
}

export interface RedeemRecord {
  redeemer: string
  created_at?: string
  redeem_item: string
}

export const useShop = () => {
  const { user, points, updatePoints } = useAuth()
  const supabase = useSupabaseClient()

  // Static shop items - in real app, this could come from Supabase
  const shopItems: ShopItem[] = [
    {
      title: "1",
      description: "Koster bare en.",
      points: 1,
      image: "🔥"
    },
    {
      title: "Meditation Cushion",
      description: "Comfortable meditation cushion to enhance your mindfulness practice.",
      points: 150,
      image: "🪑"
    },
    {
      title: "Essential Oils Set",
      description: "Complete set of essential oils for aromatherapy and relaxation.",
      points: 300,
      image: "🌿"
    },
    {
      title: "Fitness Tracker",
      description: "Smart fitness tracker to monitor your wellness journey and progress.",
      points: 500,
      image: "⌚"
    }
  ]

  const canPurchase = (item: ShopItem) => {
    return user.value && points.value >= item.points
  }

  const recordPurchase = async (item: ShopItem) => {
    if (!user.value?.id) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('redeems')
      .insert([{
        redeemer_id: user.value.id,
        redeem_item: item.title
      }] as any)

    if (error) {
      console.error('Error recording purchase:', error)
      throw error
    }

    return data
  }

  const getPurchaseHistory = async () => {
    if (!user.value?.id) {
      return []
    }

    const { data, error } = await supabase
      .from('redeems')
      .select('*')
      .eq('redeemer_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase history:', error)
      return []
    }

    return data || []
  }

  const purchaseItem = async (item: ShopItem) => {
    
    if (!user.value) {
      useNotification().show('Du må være logget inn for å kjøpe varer', 'error')
      return false
    }

    if (points.value < item.points) {
      useNotification().show('Du har ikke nok poeng for å kjøpe denne varen', 'warning')
      return false
    }

    try {
      // Deduct points first
      await updatePoints(-item.points)
      // Record the purchase in the database
      await recordPurchase(item)
      
      // Show in-app notification for the purchaser
      useNotification().show(`Du har kjøpt ${item.title}!`, 'success')
      
      return true
    } catch (error) {
      console.error('Error purchasing item:', error)
      useNotification().show('Feil ved kjøp av vare', 'error')
      return false
    }
  }

  return {
    shopItems,
    canPurchase,
    purchaseItem,
    recordPurchase,
    getPurchaseHistory
  }
}
