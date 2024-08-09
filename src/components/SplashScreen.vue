<template>
    <div class="splash-screen" :class="{ 'fade-out': fadeOut }">
      <div class="logo-container">
        <img src="/chouten.png" alt="App Logo" class="logo">
      </div>
      <h1 class="app-name">Chouten</h1>
      <p class="app-description">Your all in one multimedia app</p>
      <p class="credits">Made with ❤️ by Nabil</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SplashScreen',
    props: {
      fadeOut: Boolean
    }
  }
  </script>
  
  <style scoped>
  .splash-screen {
    background-color: #1a1a1a;
    color: white;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
    animation: fadeIn 1s ease-out;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    transition: opacity 0.5s ease-out;
    border-radius: 20px;
  }
  
  .splash-screen.fade-out {
    opacity: 0;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .logo-container {
    margin-bottom: 20px;
  }
  
  .logo {
    width: 150px;
    height: 150px;
    animation: pulse 2s infinite ease-in-out;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .app-name {
    font-size: 36px;
    margin-bottom: 10px;
    opacity: 0;
    animation: slideIn 0.5s ease-out 0.5s forwards;
  }
  
  .app-description {
    font-size: 18px;
    margin-bottom: 20px;
    opacity: 0;
    animation: slideIn 0.5s ease-out 0.7s forwards;
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .credits {
    position: absolute;
    bottom: 20px;
    font-size: 14px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 1s forwards;
  }
  </style>