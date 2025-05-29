<template>
  <div class="shop-container">
    <div class="shop-wrapper">
      <h2 class="shop-title">Shop</h2>
      <div class="shop-grid">
        <ShopCard
          v-for="item in shopItems"
          :key="item.title"
          :item="item"
          @purchase="handlePurchase"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { shopItems, purchaseItem } = useShop()

const handlePurchase = async (item: any) => {
  console.log('Purchase button clicked for item:', item)
  const result = await purchaseItem(item)
  console.log('Purchase result:', result)
}
</script>
