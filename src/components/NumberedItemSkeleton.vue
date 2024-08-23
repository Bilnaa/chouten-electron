<template>
    <div class="numbered-item skeleton">
      <div class="content">
        <div class="image-placeholder skeleton-image"></div>
        <div class="text-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-count"></div>
        </div>
      </div>
      <div class="skeleton-number"></div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'NumberedItemSkeleton'
  }
  </script>
  
  <style scoped>
  .numbered-item.skeleton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    max-width: 34vw;
    min-width: 20vw;
    overflow: hidden;
  }
  
  .content {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
  }
  
  .skeleton-image {
    width: 50px;
    height: 50px;
    background-color: #333;
    border-radius: 4px;
    margin-right: 10px;
    flex-shrink: 0;
    animation: pulse 1.5s infinite;
  }
  
  .text-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
  }
  
  .skeleton-title {
    width: 80%;
    height: 14px;
    background-color: #333;
    border-radius: 4px;
    margin-bottom: 8px;
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-count {
    width: 40%;
    height: 12px;
    background-color: #333;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
  }
  
  .skeleton-number {
    width: 24px;
    height: 24px;
    background-color: #333;
    border-radius: 4px;
    margin-left: auto;
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