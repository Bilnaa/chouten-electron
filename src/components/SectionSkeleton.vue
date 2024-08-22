<template>
    <section class="section skeleton">
      <div class="skeleton-title"></div>
      <div class="scroll-container">
        <div class="card-container">
          <div 
            v-for="i in 20" 
            :key="i" 
            class="skeleton-card"
          ></div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'SectionSkeleton'
  }
  </script>
  
  <style scoped>
  .section.skeleton {
    margin-bottom: 20px;
  }
  
  .skeleton-title {
    width: 200px;
    height: 24px;
    background-color: #333;
    margin-bottom: 10px;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
  }
  
  .scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scroll-container::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  
  .card-container {
    display: inline-flex;
    padding: 10px 0;
    gap: 10px;
  }
  
  .skeleton-card {
    flex: 0 0 auto;
    width: 160px;
    height: 240px;
    background-color: #333;
    border-radius: 8px;
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