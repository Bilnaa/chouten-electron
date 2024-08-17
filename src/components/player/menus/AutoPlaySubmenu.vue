<script setup lang="ts">
import Submenu from './Submenu.vue';
import ToggleSwitch from '../../ToggleSwitch.vue';
</script>

<template class="AutoPlaySubmenu">
    <Submenu label="Autoplay" :hint="autoPlayEnabled ? 'On' : 'Off'">
        <template #icon>
            <media-icon class="icon" type="repeat-on" />
        </template>
        <template #content>
             <ToggleSwitch
                :value="autoPlayEnabled"
                @click="onChangeAutoPlay"
                @save="saveSettings"
            />
        </template>
    </Submenu>
</template>

<script lang="ts">
export default {
    name: 'AutoPlaySubmenu',
    data() {
        return {
            autoPlayEnabled: localStorage.getItem('autoplay') === 'true'
        }
    },
    methods: {
        async onChangeAutoPlay() {
            this.autoPlayEnabled ? this.disableAutoPlay() : this.enableAutoPlay();
        },
        disableAutoPlay() {
            localStorage.setItem('autoplay', 'false');
            this.autoPlayEnabled = false;
            this.setHint();
            return this.autoPlayEnabled;
        },
        enableAutoPlay() {
            localStorage.setItem('autoplay', 'true');
            this.autoPlayEnabled = true;
            this.setHint();
            return this.autoPlayEnabled;
        },
        saveSettings() {
            console.log('Saving settings:', {
                autoPlayEnabled: this.autoPlayEnabled
            })
        },
        setHint(){
            const labels = document.querySelectorAll('.label');
            labels.forEach(label => {
                if (label.textContent === 'Autoplay') {
                    label.parentElement!.querySelector('.hint')!.innerHTML = this.autoPlayEnabled ? 'On' : 'Off';
                }
            });
        }
    },
    mounted() {
        if (localStorage.getItem('autoplay') === 'false') {
            this.disableAutoPlay();
        } else {
            this.enableAutoPlay();
        }
        setTimeout(() => {
            this.setHint();
        }, 2000);
    },

}
</script>

<style scoped>
.icon {
    width: 22px;
    height: 22px;
}
</style>