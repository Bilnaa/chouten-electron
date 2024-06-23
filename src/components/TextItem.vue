<template>
    <div class="text-item">
      <div class="image-placeholder">
        <img src="/mountains.svg" alt="Placeholder" class="image-placeholder">
      </div>
      <div class="text-content">
        <span class="text-label">Text</span>
        <h3 class="title">{{ title }}</h3>
        <span class="index">{{ index }}/12</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TextItem',
    props: {
      title: String,
      index: Number
    }
  }
  </script>
  
  <style scoped>
  .text-item {
    width: 160px;
    background-color: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .image-placeholder {
    width: 100%;
    height: 200px;
    background-color: #2a2a2a;
    margin-bottom: 10px;
  }
  
  .text-content {
    padding: 10px;
  }
  
  .text-label {
    display: inline-block;
    background-color: #333;
    color: #fff;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 8px;
  }
  
  .title {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #fff;
  }
  
  .index {
    font-size: 12px;
    color: #666;
  }
  </style>