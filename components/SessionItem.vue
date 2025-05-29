<template>
  <li>
    <div class="session-meta">
      <span :class="['session-dot', getDotClass(session.type)]"></span>
      <span class="session-date">{{ formatDate(session.created_at) }}</span>
      <span v-if="session.varighet" class="session-divider">•</span>
      <span v-if="session.varighet" class="session-duration">
        {{ formatDuration(session.varighet) }}
      </span>
      <div class="session-id">{{ session.id }}</div>
    </div>
    <div class="session-desc">
      [{{ displayName }}] {{ session.title }}{{ session.desc ? ': ' + session.desc : '' }}
      <span :class="['session-badge', badge.class]">{{ badge.label }}</span>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Session } from '~/composables/useSessions'

interface Props {
  session: Session
}

const props = defineProps<Props>()

const { getTypeBadge, getDotClass, formatDate, formatDuration } = useSessions()

const badge = computed(() => getTypeBadge(props.session.type))
const displayName = computed(() => 
  props.session.users?.name || 'Bruker'
)
</script>
