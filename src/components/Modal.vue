<template>
    <transition name="modal">
      <div v-if="show" class="modal-overlay" :style="isMaximized ? 'border-radius : 0px' : 'border-radius : 20px' " @click="$emit('close')">
        <div class="modal-content" @click.stop>
          <slot></slot>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: 'Modal',
    props: ['show'],
    data() {
      return {
        isMaximized: localStorage.getItem('isMaximized') === 'true',
      }
    },
    mounted() {
      setInterval(() => {
        if (localStorage.getItem('isMaximized') === 'true') {
          this.isMaximized = true;
        } else {
          this.isMaximized = false;
        }
      }, 1000);
    },
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #0c0c0c;
    padding: 20px;
    border-radius: 10px;
    width: 44%;
    max-height: 80%;
    overflow-y: auto;
  }
  
  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s;
  }
  
  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }
  </style>