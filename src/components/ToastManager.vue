<template>
    <div class="toast-container">
      <TransitionGroup name="toast">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :title="toast.title"
          :message="toast.message"
          :icon="toast.icon"
          :duration="toast.duration"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import Toast from './Toast.vue';
  
  interface ToastItem {
    id: number;
    title: string;
    message: string;
    icon?: string;
    duration?: number;
  }
  
  const toasts = ref<ToastItem[]>([]);
  let nextId = 0;
  
  const addToast = (title: string, message: string, icon = 'System', duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, title, message, icon, duration });
    setTimeout(() => removeToast(id), duration);
  };
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  defineExpose({ addToast });
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
    z-index: 9999;
  }
  
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
  
  .toast-move {
    transition: transform 0.3s ease;
  }
  </style>