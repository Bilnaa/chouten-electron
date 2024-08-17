<template>
    <div class="settings-modal">
      <div class="settings-header">
        <h2>Settings</h2>
      </div>
      <div class="settings-content">
        <div class="setting">
          <label for="discord-rpc">Discord RPC</label>
          <ToggleSwitch :value="discordRpcEnabled" id="discord-rpc" @click="onChangeDiscordRPC" />
        </div>
        <div class="setting">
          <label for="dev-mode">Developer Mode</label>
          <ToggleSwitch :value="devModeEnabled" id="dev-mode" @click="setDevMode" />
        </div>
        <div class="setting">
          <label for="accent-color">Accent Color</label>
          <ColorPicker :value="accentColor" id="accent-color" @input="accentColor = $event" />
        </div>
      </div>
      <div class="settings-footer"></div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
import ToggleSwitch from './ToggleSwitch.vue';
import ColorPicker from './ColorPicker.vue';

export default {
  name: 'SettingsModal',
  components: {
    ToggleSwitch,
    ColorPicker
  },
  computed: {
    ...mapState(['discordRpcEnabled'])
  },
  data() {
    return {
      devModeEnabled: localStorage.getItem('devModeEnabled') === 'undefined' ? false : localStorage.getItem('devModeEnabled') === 'true',
      accentColor: '#6200ee',
    }
  },
  methods: {
    ...mapActions(['enableDiscordRPC', 'disableDiscordRPC']),
    async onChangeDiscordRPC() {
      await window.ipcRenderer.invoke('get-discord-status') ? this.disableDiscordRPC() : this.enableDiscordRPC();
    },
    saveSettings() {
      // Save the settings to the application's state or persistent storage
      console.log('Saving settings:', {
        discordRpcEnabled: this.discordRpcEnabled,
        devModeEnabled: this.devModeEnabled,
        accentColor: this.accentColor
      })
    },
    setDevMode() {
      console.log('Setting dev mode', !this.devModeEnabled);
      localStorage.setItem('devModeEnabled', (!this.devModeEnabled).toString());
      this.devModeEnabled = !this.devModeEnabled;
      if(this.devModeEnabled) {
        window.ipcRenderer.invoke('show-hidden-window');
      } else {
        window.ipcRenderer.invoke('hide-hidden-window');
      }
      location.reload();
    }
  },
  mounted() {
    this.$store.dispatch('fetchDiscordRPCStatus');
  }
}
  </script>
  
  
  <style scoped>
  .settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.settings-content {
  margin-bottom: 24px;
}

.setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.setting label {
  font-size: 16px;
}
  </style>