<template>
    <div class="numbered-item">
      <span class="number">{{ number }}</span>
      <h3>{{ title }}</h3>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NumberedItem',
    props: ['number', 'title']
  }
  </script>
  
  <style scoped>
  .numbered-item {
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    border-radius: 5px;
    padding: 10px;
    margin-right: 10px;
    flex-shrink: 0;
    width: 200px;
  }
  .number {
    font-size: 24px;
    margin-right: 10px;
  }
  </style>