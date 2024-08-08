<template>
    <div class="color-picker">
      <div class="color-grid">
        <div
          v-for="color in colors"
          :key="color"
          class="color-tile"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        >
          <div class="checkmark" v-if="selectedColor == color">✓</div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'ColorPicker',
    props: {
      value: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        colors: ['#6200ee', '#e91e63', '#009688', '#ff9800', '#4caf50', '#2196f3'],
        selectedColor: localStorage.getItem('accentColor') || '#6200ee'
      }
    },
    methods: {
      selectColor(color) {
        this.$emit('input', color)
        if(localStorage.getItem('accentColor') === null) {
          localStorage.setItem('accentColor', color)
          this.selectedColor = color
          document.documentElement.style.setProperty('--accent-color', color);
        } else {
          localStorage.removeItem('accentColor')
          localStorage.setItem('accentColor', color)
            this.selectedColor = color
          document.documentElement.style.setProperty('--accent-color', color);
      }
    }
  }
    }
  </script>
  
  <style scoped>
  .color-picker {
    width: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
  }
  
  .color-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 8px;
  }
  
  .color-tile {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }
  
  .checkmark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 16px;
  }
  </style>