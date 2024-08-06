<template>
  <div class="sidebar" :style="{backgroundColor : isLinux ? '#171717': ''}">
    <div class="logo-container" @click="isOpened=!isOpened">
      <div class="logo-placeholder" v-if="!isLogged">
        <span>LOGO</span>
      </div>
      <div class="logo-placeholder" v-else>
        <img :src="discordAvatar" alt="avatar" width="40" height="40" />
      </div>
    </div>

    <Modal v-if="isOpened" :show="showModal" @close="closeModal">
      <h1>Sign in</h1>
      <p>Still WIP</p>
    </Modal>
    
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
import Archive from 'vue-material-design-icons/Archive.vue'
import Modal from './Modal.vue'

export default {
  name: 'Sidebar',
  components: {
    HomeIcon,
    CompassIcon,
    PackageVariantClosedIcon,
    CogIcon,
    Archive,
    Modal
  },
  data() {
    return {
      isLinux: navigator.userAgent.includes('Linux'),
      isLogged: false,
      discordUsername: '',
      discordAvatar: '',
      userCheckInterval: null,
      lastUserData: null,
      isOpened: false
    }
  },
  methods: {
    loadDiscordImage(id, avatar) {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
    },
    showModal() {
      this.isOpened = true;
    },
    closeModal() {
      this.isOpened = false;
    },
    updateUserData() {
      const userData = localStorage.getItem('user');
      // Check if user data has changed
      if (userData !== this.lastUserData) {
        this.lastUserData = userData;
        
        if (userData) {
          this.isLogged = true;
          const parsedUser = JSON.parse(userData.replace(/%22/g, '"'));
          this.discordUsername = parsedUser.username;
          this.discordAvatar = this.loadDiscordImage(parsedUser.id, parsedUser.avatar);
        } else {
          this.isLogged = false;
          this.discordUsername = '';
          this.discordAvatar = '';
        }
      }
    }
  },
  mounted() {
    this.updateUserData();
    // Check for changes every second
    this.userCheckInterval = setInterval(this.updateUserData, 1000);
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed
    if (this.userCheckInterval) {
      clearInterval(this.userCheckInterval);
    }
  }
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
  cursor: pointer;
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

.logo-placeholder img {
  border-radius: 50%;
}

.logo-placeholder .username {
  font-size: 12px;
  color: #fff;
  margin-top: 5px;
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
