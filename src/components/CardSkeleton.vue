<template>
    <div class="card skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'CardSkeleton'
  }
  </script>
  
  <style scoped>
  .card.skeleton {
    width: 300px;
    height: 400px;
    border-radius: 20px;
    overflow: hidden;
    background-color: #1e1e1e;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  .skeleton-image {
    width: 100%;
    height: 70%;
    background-color: #2a2a2a;
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-content {
    padding: 15px;
  }
  
  .skeleton-title {
    width: 80%;
    height: 24px;
    background-color: #2a2a2a;
    margin-bottom: 15px;
    animation: pulse 1.5s infinite;
    border-radius: 12px;
  }
  
  .skeleton-description {
    width: 100%;
    height: 12px;
    background-color: #2a2a2a;
    margin-bottom: 10px;
    animation: pulse 1.5s infinite;
    border-radius: 6px;
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