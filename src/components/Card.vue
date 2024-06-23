<template>
    <div class="card">
      <img src="/mountains.svg" alt="Mountains" />
      <div class="card-content">
        <p class="secondary">Secondary</p>
        <h2>Primary</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc semper urna enim, quis blandit elit sodales et. Morbi quis tortor a velit ultricies elementum. Morbi auctor vitae risus sed fermentum.</p>
      </div>
      <div class="card-footer">
        <span>Text</span>
        <span class="heart">❤️</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Card'
  }
  </script>
  
  <style scoped>
  .card {
    width: 300px;
    background-color: #2a2a2a;
    border-radius: 10px;
    margin-right: 20px;
    flex-shrink: 0;
  }
  .card img {
    width: 100%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .card-content {
    padding: 20px;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
  }
  </style>