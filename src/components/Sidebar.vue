<template>
  <div class="sidebar" :style="{backgroundColor : isLinux ? '#171717': ''}">
    <div class="logo-container">
      <div class="logo-placeholder">
        <span>LOGO</span>
      </div>
    </div>
    
    <div class="main-content">
      <nav class="main-nav">
        <ul>
          <li>
            <router-link to="/" exact>
              <HomeIcon :size="24" />
            </router-link>
          </li>
          <li>
            <router-link to="/discover">
              <CompassIcon :size="24" />
            </router-link>
          </li>
          <li>
            <router-link to="/repo">
              <PackageVariantClosedIcon :size="24" />
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <div class="bottom-icons">
      <button @click="$emit('open-module-selector')" class="select-module-btn">
        <Archive :size="24" />
      </button>
      <router-link to="/settings" class="settings-btn">
        <CogIcon :size="24" />
      </router-link>
    </div>
  </div>

</template>


<script>
import HomeIcon from 'vue-material-design-icons/Home.vue'
import CompassIcon from 'vue-material-design-icons/Compass.vue'
import PackageVariantClosedIcon from 'vue-material-design-icons/PackageVariantClosed.vue'
import CogIcon from 'vue-material-design-icons/Cog.vue'
import Archive from 'vue-material-design-icons/Archive.vue' // Ensure this import is correct

export default {
  name: 'Sidebar',
  components: {
    HomeIcon,
    CompassIcon,
    PackageVariantClosedIcon,
    CogIcon,
    Archive 
  },
  data() {
    return {
      isLinux: navigator.userAgent.includes('Linux'),
    }
  },
}
</script>

<style scoped>
.sidebar {
  width: 120px;
  height: 100vh; /* Full viewport height */
  display: flex;
  position: absolute;
  flex-direction: column;
  justify-content: space-between; /* Space between top and bottom sections */
  align-items: center;
  padding-top: 50px;
  box-sizing: border-box; /* Ensure padding is included in width/height calculations */
}

.logo-container {
  margin-bottom: 40px;
}

.logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: #fff;
  font-weight: bold;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  top: 10px; 
  flex-grow: 1; 
  justify-content: center;
}

.main-nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-nav li {
  margin-bottom: 20px;
}

.main-nav a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.main-nav a:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.main-nav a.router-link-active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  filter: drop-shadow(0 0 16px rgba(100, 88, 237, 1)); /* Stronger glow */
}

.bottom-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px; /* Ensure space at the bottom */
}

.select-module-btn,
.settings-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-bottom: 10px; /* Space between buttons */
}

.select-module-btn:hover,
.settings-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.select-module-btn:focus,
.settings-btn:focus {
  outline: none;
  filter: drop-shadow(0 0 16px rgba(100, 88, 237, 1)); /* Stronger glow */
}
</style>
