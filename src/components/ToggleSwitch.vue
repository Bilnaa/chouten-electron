<template>
    <div class="toggle-switch" @click="toggleSwitch">
      <div class="toggle-knob" :class="{ 'active': value }"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ToggleSwitch',
    props: {
      value: {
        type: Boolean,
        required: true
      }
    },
    methods: {
      toggleSwitch() {
        this.$emit('input', !this.value)
      }
    }
  }
  </script>
  
  <style scoped>
  .toggle-switch {
    width: 40px;
    height: 24px;
    background-color: #ccc;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
  }
  
  .toggle-knob {
    width: 20px;
    height: 20px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
  }
  
  .toggle-knob.active {
    transform: translateX(16px);
    background-color: var(--accent-color);
  }
  </style>