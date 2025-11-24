<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'
import { mdiHome, mdiStar } from '@mdi/js'

const route = useRoute()
const messages = useMessagesStore()
</script>

<template>
  <div class="wrapper">
    <div class="container">
      <header class="topbar">
        <div class="brand">
          <h1>Movie Explorer</h1>
          <p class="subtitle">Search, discover, and collect your favorite movies.</p>
        </div>
      </header>

      <nav class="nav">
        <RouterLink :class="{ active: route.name === 'home' }" to="/"
          ><VIcon size="20" :icon="mdiHome" /> Home</RouterLink
        >
        <RouterLink :class="{ active: route.name === 'favorites' }" to="/favorites">
          <VIcon size="20" :icon="mdiStar" /> Favorites
        </RouterLink>
      </nav>

      <section class="view">
        <RouterView />
      </section>
    </div>

    <VSnackbarQueue v-model="messages.queue" closable location="bottom" timeout="3000" />
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
  color: #1e2a3b;

  .container {
    max-width: 1200px;
    margin: 24px auto;
    padding: 20px;
    border: 1px solid var(--ui-border);
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(20, 40, 80, 0.05);

    .topbar {
      padding: 4px 2px 12px;

      .brand {
        h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.5px;
        }

        .subtitle {
          margin: 4px 0 0;
          color: #5c6b80;
        }
      }
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      margin: 0 -20px;
      border-bottom: 1px solid var(--ui-border);

      a {
        text-decoration: none;
        color: #2f3c4f;
        padding: 8px 12px;
        border: 1px solid transparent;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        &.active {
          color: var(--primary-color);
          font-weight: 500;
          border-bottom-color: var(--primary-color);
        }
      }
    }

    .divider {
      height: 1px;
      background: var(--ui-border);
      margin: 4px 0 8px;
    }

    .view {
      padding-top: 8px;
    }
  }
}
</style>
