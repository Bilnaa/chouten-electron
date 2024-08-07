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
      <div v-if="!isLogged">
        <h1>Sign in</h1>
        <button @click="login" class="discord-btn">Login with Discord</button>
      </div>
      <div v-else>
        <h4>Logged in as {{ discordUsername }}</h4>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
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
import { createClient } from '@supabase/supabase-js'

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
      loginUrl : 'https://ydiykaztjeqavsucbpko.supabase.co/auth/v1/authorize?provider=discord',
      isOpened: false,
      supabase: createClient('https://ydiykaztjeqavsucbpko.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXlrYXp0amVxYXZzdWNicGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzk1ODcsImV4cCI6MjAzODYxNTU4N30.aVMFp5TEH0zxyup4zdsQh5dLZ2liCC6vBJVyTutZ2DY',{
        persistSession : true
      }),
    }
  },
  methods: {
    showModal() {
      this.isOpened = true;
    },
    closeModal() {
      this.isOpened = false;
    },
    async updateUserData() {
      let token = localStorage.getItem('supabase.auth.token');
      if (token) {
        this.isLogged = true;
        token = JSON.parse(token);
        const { data, error } = await this.supabase.auth.getUser(token.access_token);
        if (error) {
          console.error(error);
        } else {
          this.discordUsername = data.user.user_metadata.full_name;
          this.discordAvatar = data.user.user_metadata.avatar_url;
        }
      } else {
        this.isLogged = false;
      }
    },
    async logout() {
      localStorage.removeItem('supabase.auth.token');
      this.isLogged = false;
    },
    async login() {
        window.ipcRenderer.invoke('open-win', this.loginUrl);
        
        const checkAuth = setInterval(() => {
          const token = localStorage.getItem('supabase.auth.token');
          if (token) {
            clearInterval(checkAuth);
            this.isOpened = false;
            this.updateUserData();
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(checkAuth);
          console.log('Login timeout: window may have been closed');
        }, 300000);
}
  },
  async mounted() {
    this.updateUserData();
  },
}
</script>

<style scoped>
.sidebar {
  width: 120px;
  height: 100vh;
  display: flex;
  position: absolute;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-top: 50px;
  box-sizing: border-box;
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
  filter: drop-shadow(0 0 16px rgba(100, 88, 237, 1));
}

.bottom-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
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
  margin-bottom: 10px;
}

.select-module-btn:hover,
.settings-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.select-module-btn:focus,
.settings-btn:focus {
  outline: none;
  filter: drop-shadow(0 0 16px rgba(100, 88, 237, 1));
}

.discord-btn, .logout-btn {
  background-color: #7289da;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.discord-btn:hover {
  background-color: #5e77d4;
}

.logout-btn {
  background-color: #f04747;
}

.logout-btn:hover {
  background-color: #d84040;
}
</style>