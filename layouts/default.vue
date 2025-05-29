<template>
  <div>
    <Html lang="no" />
    <Head>
      <Title>{{ title || 'My Shop' }}</Title>
      <Meta name="description" :content="description || ''" />
    </Head>
    
    <AppHeader />
    
    <main>
      <slot />
    </main>
    
    <AppNotifications />
    
    <!-- Modals -->
    <SessionModal />
    <AddSessionModal />
    <DeleteSessionModal />
  </div>
</template>

<script setup lang="ts">
interface LayoutProps {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<LayoutProps>(), {
  title: 'Treningslogg',
  description: ''
})
</script>

<style>
/* Global styles will be handled by CSS files */
</style>
