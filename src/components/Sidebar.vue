<template>
  <div class="sidebar" :style="{ backgroundColor: isLinux ? '#171717' : '' }">
    <div class="logo-container" @click="isOpened = !isOpened">
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
        <div class="login-options">
          <div class="login-option" @click="login">
            <img src="/icon_clyde_blurple_RGB.svg" alt="Discord">
            <span>Login with Discord</span>
          </div>
        </div>
      </div>
      <div v-else>
        <h4>Logged in as {{ discordUsername }}</h4>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </Modal>

    <div class="main-content">
      <nav class="main-nav">
        <ul>
          <!-- <li>
            <router-link to="/" exact>
              <HomeIcon :size="24" />
            </router-link>
          </li> -->
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
      <button @click="$emit('open-settings')" class="settings-btn">
        <CogIcon :size="24" />
      </button>
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
      isLinux: navigator.userAgent.includes('Linux') || navigator.userAgent.includes('Windows') ,
      isLogged: false,
      discordUsername: '',
      discordAvatar: '',
      userCheckInterval: null,
      lastUserData: null,
      loginUrl: 'https://ydiykaztjeqavsucbpko.supabase.co/auth/v1/authorize?provider=discord',
      isOpened: false,
      supabase: createClient('https://ydiykaztjeqavsucbpko.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXlrYXp0amVxYXZzdWNicGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzk1ODcsImV4cCI6MjAzODYxNTU4N30.aVMFp5TEH0zxyup4zdsQh5dLZ2liCC6vBJVyTutZ2DY', {
        persistSession: true
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
      const token = JSON.parse(localStorage.getItem('supabase.auth.token'));
      if (!token) {
        this.isLogged = false;
        return;
      }
      this.isLogged = true;
      try {
        const { data: userData } = await this.supabase.auth.getUser(token.access_token);
        this.setUserMetadata(userData.user);
      } catch (error) {
        console.error('Error getting user:', error);
        try {
          const { data: refreshedData } = await this.supabase.auth.refreshSession(token.refresh_token);
          localStorage.setItem('supabase.auth.token', JSON.stringify(refreshedData));
          this.setUserMetadata(refreshedData.user);
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
          this.isLogged = false;
          localStorage.removeItem('supabase.auth.token');
        }
      }
    },
    setUserMetadata(user) {
      this.discordUsername = user.user_metadata.full_name;
      this.discordAvatar = user.user_metadata.avatar_url;
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
  filter: drop-shadow(0 0 16px var(--accent-color));
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

.discord-btn,
.logout-btn {
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

/* New Modal styles */
.modal {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #36393f;
  margin: auto;
  padding: 20px;
  border-radius: 5px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal h1 {
  color: #fff;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.modal h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
}

.modal .discord-btn,
.modal .logout-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
}

.modal .close-btn {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.modal .close-btn:hover,
.modal .close-btn:focus {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

/* Styles for future login options */
.login-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-option {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #2f3136;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-option:hover {
  background-color: #40444b;
}

.login-option img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.login-option span {
  color: #fff;
  font-size: 16px;
}
</style>