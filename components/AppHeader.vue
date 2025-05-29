<template>
  <header>
    <div class="header-content">
      <div class="points-section">
        <Icon name="lucide:cat" class="lucide-cat" />
        <span class="points-value">{{ points }}</span>
        <span class="points-label">poeng</span>
      </div>
      
      <div class="user-section">
        <div class="user-section">
          <button 
            v-if="!isLoggedIn"
            @click="loginWithGoogle"
            class="user-btn"
          >
            Logg inn med Google
          </button>
          
          <button 
            v-else
            class="user-btn"
            disabled
          >
            <Icon name="lucide:user-check" />
            {{ user?.email }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, points, isLoggedIn, loginWithGoogle } = useAuth()
</script>
