<template>
    <div class="toast-notification">
      <div class="toast-content">
        <strong class="toast-title">{{ title }}:</strong>
        <span class="toast-message">{{ message }}</span>
      </div>
      <span class="toast-icon">{{ icon }}</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  
  const props = defineProps<{
    title: string;
    message: string;
    duration?: number;
    icon?: string;
  }>();
  
  const emit = defineEmits(['close']);
  
  onMounted(() => {
    setTimeout(() => emit('close'), props.duration || 3000);
  });
  </script>
  
  <style scoped>
  .toast-notification {
    bottom: 20px;
    right: 20px;
    background-color: rgba(30, 30, 30, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    max-width: 400px;
  margin-top: 10px; /* Add some space between toasts */

    backdrop-filter: blur(10px);
  }
  
  .toast-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-right: 12px;
  }
  
  .toast-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .toast-message {
    font-size: 14px;
    opacity: 0.8;
  }
  
  .toast-icon {
    background-color: #3a3a3a;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
  </style>