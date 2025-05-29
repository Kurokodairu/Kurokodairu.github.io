<template>
  <div class="shop-card">
    <div class="shop-card-content">
      <div class="shop-card-icon">{{ item.image }}</div>
      <h3 class="shop-card-title">{{ item.title }}</h3>
      <p class="shop-card-description">{{ item.description }}</p>
      <div class="shop-card-price">
        <span class="price-amount">{{ item.points }}</span>
        <span class="price-label">points</span>
      </div>
      <button 
        class="shop-card-btn"
        :disabled="!canPurchase(item)"
        @click="handlePurchase"
      >
        <Icon name="lucide:shopping-cart" />
        Redeem
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShopItem } from '~/composables/useShop'

interface Props {
  item: ShopItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  purchase: [item: ShopItem]
}>()

const { canPurchase } = useShop()

const handlePurchase = () => {
  emit('purchase', props.item)
}
</script>
