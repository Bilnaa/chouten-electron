<template>
  <div class="sidebar">
    <div class="logo-container">
      <div class="logo-placeholder">
        <span>LOGO</span>
      </div>
    </div>
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
    <div class="settings">
      <router-link to="/settings">
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

export default {
  name: 'Sidebar',
  components: {
    HomeIcon,
    CompassIcon,
    PackageVariantClosedIcon,
    CogIcon
  }
}
</script>

<style scoped>
.sidebar {
  width: 120px;
  background-color: #121212;
  padding-top : 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 98%;
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

.main-nav {
  flex-grow: 0.9;
  display: flex;
  align-items: center;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar li {
  margin-bottom: 20px;
}

.sidebar a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

</style>