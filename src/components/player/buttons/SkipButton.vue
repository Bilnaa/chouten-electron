<template>
    <transition name="fade">
      <button v-if="isVisible" @click="skip" class="skip-button">
        <div class="skip-button-content">
          <span class="skip-text">{{ skipData.title }}</span>
          <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
      </button>
    </transition>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, watch } from 'vue';
  
  export default defineComponent({
    name: 'SkipButton',
    props: {
      skipData: {
        type: Object,
        required: true
      },
      currentTime: {
        type: Number,
        required: true
      }
    },
    setup(props, { emit }) {
      const isVisible = ref(false);
  
      const progress = computed(() => {
        const duration = props.skipData.end - props.skipData.start;
        const elapsed = props.currentTime - props.skipData.start;
        return Math.min(Math.max((elapsed / duration) * 100, 0), 100);
      });
  
      watch(() => props.currentTime, (newTime) => {
        isVisible.value = newTime >= props.skipData.start && newTime < props.skipData.end;
      });
  
      const skip = () => {
        emit('skip', props.skipData.end);
      };
  
      return {
        isVisible,
        progress,
        skip
      };
    }
  });
  </script>
  
  <style scoped>
  .skip-button {
    position: absolute;
    bottom: 80px;
    right: 20px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    z-index: 10;
  }
  
  .skip-button-content {
    position: absolute;
    right: 0px;
    bottom: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3B3B3B;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    overflow: hidden;
    min-width: 120px;
  }
  
  .skip-text {
    font-size: 14px;
    font-weight: 600;
    z-index: 2;
  }
  
  .progress-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.1s linear;
    z-index: 1;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>