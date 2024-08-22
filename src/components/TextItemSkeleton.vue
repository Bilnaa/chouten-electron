<template>
    <div class="text-item skeleton">
      <div class="image-container">
        <div class="skeleton-cover"></div>
        <div class="skeleton-label"></div>
      </div>
      <div class="text-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-index"></div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'TextItemSkeleton'
  }
  </script>
  
  <style scoped>
  .text-item.skeleton {
    width: 160px;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #1e1e1e;
  }
  
  .image-container {
    width: 100%;
    height: 240px;
    position: relative;
    overflow: hidden;
  }
  
  .skeleton-cover {
    width: 100%;
    height: 100%;
    background-color: #2a2a2a;
    border-radius: 12px;
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-label {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 20px;
    background-color: #333;
    border-radius: 12px;
    animation: pulse 1.5s infinite;
  }
  
  .text-content {
    padding: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .skeleton-title {
    width: 90%;
    height: 16px;
    background-color: #2a2a2a;
    margin-bottom: 4px;
    border-radius: 8px;
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-index {
    width: 40%;
    height: 12px;
    background-color: #2a2a2a;
    border-radius: 6px;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
  </style>