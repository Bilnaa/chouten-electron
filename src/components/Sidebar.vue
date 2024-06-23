
<template>
    <div class="sidebar">
      <div class="logo-container">
        <!-- Logo placeholder -->
        <div class="logo-placeholder">
          <span>LOGO</span>
        </div>
      </div>
      <nav>
        <ul>
          <li><a href="#">
            <HomeIcon />
          </a></li>
          <li><a href="#">
            <MagnifyIcon />
          </a></li>
          <li><a href="#">
            <PackageVariantClosedIcon />
          </a></li>
          <!-- q: for the code above i need something right for it to show the actual icons ? a: Yes, you need to use an icon library like Font Awesome or Material Icons. -->
        </ul>
      </nav>
    </div>
  </template>
  
  <script>
  import HomeIcon from 'vue-material-design-icons/Home.vue'
  import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
  import PackageVariantClosedIcon from 'vue-material-design-icons/PackageVariantClosed.vue'
  export default {
    name: 'Sidebar',
    components: {
      HomeIcon,
      MagnifyIcon,
    PackageVariantClosedIcon

    }
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 60px;
    background-color: #252525;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .logo-container {
    margin-bottom: 20px;
  }
  
  .logo-placeholder {
    width: 40px;
    height: 40px;
    background-color: #444;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: #fff;
    font-weight: bold;
  }
  
  .sidebar ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar li {
    padding: 10px 0;
    text-align: center;
  }
  
  .sidebar a {
    color: #888;
    text-decoration: none;
  }
  
  .sidebar a:hover {
    color: #fff;
  }
  </style>