<template>
    <div class="reader-container" :class="{ fullscreen: isFullscreen }">

        <div class="settings-panel">
            <button class="icon-button" @click="$router.go(-1)">
                <ArrowLeftIcon :size="24" />
            </button>

            <div class="page-display">
                <span>{{ title }} - {{ episodeTitle }}</span>
                <br>
                <span>Pg. {{ currentPage + 1 }} / {{ totalPages }}</span>
            </div>
            <div class="icons" style="display: flex;">

                <button @click="toggleFullscreen" class="icon-button">
                    <FullscreenIcon :size="24" />
                </button>
                <button @click="toggleSettings" class="icon-button">
                    <CogIcon :size="24" />
                </button>
            </div>
        </div>

        <div class="image-container" :class="[currentStyle.class]" @wheel="handleWheel" ref="imageContainer">
            <template v-if="currentStyle.value === 'single'">
                <img :src="visibleImages[0]" :alt="`Page ${currentPage + 1}`" :imageStyle="imageStyle" />
            </template>
            <template v-else-if="currentStyle.value === 'double'">
                <img v-for="(image, index) in visibleImages" :key="index" :src="image"
                    :alt="`Page ${currentPage * 2 + index + 1}`" :imageStyle="imageStyle" />
            </template>
            <template v-else-if="currentStyle.value === 'continuous' || currentStyle.value === 'webtoon'">
                <div :class="currentStyle.value">
                    <img v-for="(image, index) in images" :key="index" :src="image" :alt="`Page ${index + 1}`"
                        :imageStyle="imageStyle" />
                </div>
            </template>
        </div>

        <div class="navigation" v-if="currentStyle.value !== 'continuous' && currentStyle.value !== 'webtoon'">
            <button @click="previousPage" :disabled="currentPage === 0" class="icon-button">
                <ArrowLeftIcon :size="24" />
            </button>
            <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
            </div>
            <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="icon-button">
                <ArrowRightIcon :size="24" />
            </button>
        </div>

        <div v-if="showSettings" class="reader-settings">
            <h3>Reader Settings</h3>
            <label for="reading-style">Reading Style:</label>
            <select v-model="selectedStyle" id="reading-style">
                <option v-for="style in availableStyles" :key="style.value" :value="style.value">
                    {{ style.label }}
                </option>
            </select>

            

            <label for="reading-direction">Reading Direction:</label>
            <span class="hint">
                Changes the way you navigate pages with arrow keys 
            </span>
            <select v-model="readingDirection" id="reading-direction">
                <option value="ltr">Left to Right</option>
                <option value="rtl">Right to Left</option>
            </select>
            
            
            <label for="zoom-level">Zoom Level:</label>
            <input type="range" v-model="zoomLevel" min="0.5" max="3" step="0.1" id="zoom-level">

            <label for="fit-to-width">Fit to Width:</label>
            <input type="checkbox" v-model="fitToWidth" id="fit-to-width">
        </div>
    </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import CogIcon from 'vue-material-design-icons/Cog.vue';
import FullscreenIcon from 'vue-material-design-icons/Fullscreen.vue';
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue';
import ArrowRightIcon from 'vue-material-design-icons/ArrowRight.vue';

export default {
    components: {
        CogIcon,
        FullscreenIcon,
        ArrowLeftIcon,
        ArrowRightIcon,
    },
    props: ["episodeId", "episodeTitle", "title"],
    setup(props) {
        const episodeId = props.episodeId;
        const selectedStyle = ref('single');
        const readingDirection = ref('ltr');
        const currentPage = ref(0);
        const store = useStore();
        const zoomLevel = ref(1);
        const isFullscreen = ref(false);
        const showSettings = ref(false);
        const imageContainer = ref(null);
        const images = ref([]);
        const scrollAccumulator = ref(0);
        const fitToWidth = ref(false);

        const availableStyles = [
            { value: 'single', label: 'Single Page', class: 'single-page' },
            { value: 'double', label: 'Double Page', class: 'double-page' },
            { value: 'continuous', label: 'Continuous Scroll', class: 'continuous-scroll' },
            { value: 'webtoon', label: 'Webtoon', class: 'webtoon-scroll' },
        ];

        const progress = computed(() => {
            return ((currentPage.value + 1) / totalPages.value) * 100;
        });

        const currentStyle = computed(() => {
            return availableStyles.find(style => style.value === selectedStyle.value);
        });

        const totalPages = computed(() => {
            if (currentStyle.value.value === 'continuous' || currentStyle.value.value === 'webtoon') {
                return images.value.length;
            }
            return currentStyle.value.value === 'double' ? Math.ceil(images.value.length / 2) : images.value.length;
        });

        const visibleImages = computed(() => {
            if (currentStyle.value.value === 'single') {
                return [images.value[currentPage.value]];
            } else if (currentStyle.value.value === 'double') {
                const startIndex = currentPage.value * 2;
                return images.value.slice(startIndex, startIndex + 2);
            }
            return images.value;
        });

        const imageStyle = computed(() => {
            return {
                transform: `scale(${zoomLevel.value})`,
                width: fitToWidth.value ? '100%' : 'auto',
                height: fitToWidth.value ? 'auto' : '100%',
            };
        });

        function nextPage() {
            if (currentPage.value < totalPages.value - 1) {
                currentPage.value++;
            }
        }

        function previousPage() {
            if (currentPage.value > 0) {
                currentPage.value--;
            }
        }

        function handleKeyDown(event) {
            const isRightToLeft = readingDirection.value === 'rtl';
            switch (event.key) {
                case 'ArrowRight':
                    isRightToLeft ? previousPage() : nextPage();
                    break;
                case 'ArrowLeft':
                    isRightToLeft ? nextPage() : previousPage();
                    break;
                case 'ArrowDown':
                    if (currentStyle.value.value === 'continuous' || currentStyle.value.value === 'webtoon') {
                        imageContainer.value.scrollTop += window.innerHeight / 2;
                    } else {
                        nextPage();
                    }
                    break;
                case 'ArrowUp':
                    if (currentStyle.value.value === 'continuous' || currentStyle.value.value === 'webtoon') {
                        imageContainer.value.scrollTop -= window.innerHeight / 2;
                    } else {
                        previousPage();
                    }
                    break;
            }
        }

        function handleWheel(event) {
            if ((event.ctrlKey || event.metaKey) && event.deltaY !== 0) {
                event.preventDefault();
                adjustZoom(event.deltaY > 0 ? -0.1 : 0.1);
            } else if (currentStyle.value.value !== 'continuous' && currentStyle.value.value !== 'webtoon') {
                event.preventDefault();
                const scrollThreshold = 100; // Adjust this value to change scroll sensitivity
                scrollAccumulator.value += event.deltaY;
                if (Math.abs(scrollAccumulator.value) >= scrollThreshold) {
                    if (scrollAccumulator.value > 0) {
                        nextPage();
                    } else {
                        previousPage();
                    }
                    scrollAccumulator.value = 0;
                }
            }
        }

        function adjustZoom(delta) {
            zoomLevel.value = Math.max(0.5, Math.min(3, zoomLevel.value + delta));
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                isFullscreen.value = true;
            } else {
                document.exitFullscreen();
                isFullscreen.value = false;
            }
        }

        function goToPage(index) {
            currentPage.value = index;
        }

        function toggleSettings() {
            showSettings.value = !showSettings.value;
        }

        async function injectInstance() {
            let activeModule = store.state.activeModule;
            let modulePath = await window.ipcRenderer.invoke('get-module-path', activeModule.id);
            let code = modulePath.modulePath + '/code.js';
            let injectJs = await window.ipcRenderer.invoke('load-script', code);
            while (injectJs.success === false) {
                console.log(injectJs.error);
                if (injectJs.error === 'ENOENT: no such file or directory') {
                    break;
                }
                injectJs = await window.ipcRenderer.invoke('load-script', code);
            }
        }

        async function executeJs(code: string) {
            let executedJs;
            try {
                executedJs = await window.ipcRenderer.invoke('execute-script', code);
            } catch (error) {
                throw new Error((error as Error).message);
            }
            return executedJs
        }

        async function fetchPages(episodeId) {
            let pages = await executeJs(`const instance = new source.default(); return instance.pages("${episodeId}")`);
            if (pages.success) {
                return pages.result;
            } else {
                throw new Error(pages.error);
            }
        }

        function updateDiscordPresence(state: string) {
            const { episodeTitle, title } = props;

            const presence: Presence = {
                details: episodeTitle ?? 'No episode title',
                state: `${state} ${title}`,
                largeImageKey: 'icon',
                largeImageText: title,
                buttons: [
                    { label: 'Get Chouten', url: 'https://github.com/Bilnaa/chouten-electron' },
                    { label: 'Join Discord', url: 'https://discord.gg/j5ETh7uSy6' },
                ],
                instance: false,
            };
            if (state === 'Reading') {
                presence.startTimestamp = Date.now();
            }
            window.ipcRenderer.invoke('set-discord-presence', presence);
        }

        onBeforeMount(async () => {
            await injectInstance();
            let pages = await fetchPages(episodeId);
            images.value = pages;
        });

        onMounted(() => {
            window.addEventListener('keydown', handleKeyDown);
            document.addEventListener('fullscreenchange', () => {
                isFullscreen.value = !!document.fullscreenElement;
            });
            if (imageContainer.value) {
                imageContainer.value.classList.toggle('rtl', readingDirection.value === 'rtl');
            }
            updateDiscordPresence('Reading');
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeyDown);
        });

        watch(selectedStyle, (newStyle, oldStyle) => {
            if (newStyle === 'continuous' || newStyle === 'webtoon') {
                currentPage.value = 0;
                nextTick(() => {
                    if (imageContainer.value) {
                        imageContainer.value.scrollTop = 0;
                    }
                });
            }
        });

        watch(readingDirection, (newDirection) => {
            if (imageContainer.value) {
                imageContainer.value.classList.toggle('rtl', newDirection === 'rtl');
            }
        });

        return {
            selectedStyle,
            readingDirection,
            currentPage,
            zoomLevel,
            isFullscreen,
            showSettings,
            images,
            availableStyles,
            imageContainer,
            currentStyle,
            totalPages,
            visibleImages,
            imageStyle,
            fitToWidth,
            nextPage,
            previousPage,
            handleWheel,
            toggleFullscreen,
            goToPage,
            toggleSettings,
            progress,
        };
    },
};
</script>

<style scoped>
.hint {
    font-size: 12px;
    color: #999;
    padding-bottom: 1rem;
}

.reader-container {
    max-width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
    height: 95vh;
    color: var(--text-color);
}

.settings-panel {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
    align-items: center;
}

.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    transition: background-color 0.2s ease;
    color: white;
}

.icon-button:hover {
    background-color: #333;
    border-radius: 4px;
}

.page-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
    height: calc(100vh - 120px);
    scroll-behavior: smooth;
}

.image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.2s ease;
}

.single-page img {
    max-width: 100%;
}

.double-page {
    display: flex;
    justify-content: center;
}

.double-page img {
    max-width: 50%;
}

.continuous-scroll,
.webtoon-scroll {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.continuous-scroll img,
.webtoon-scroll img {
    width: 100%;
    height: auto;
    margin-bottom: 20px;
    object-fit: contain;
}

.webtoon-scroll {
    max-width: 100%;
}

.webtoon-scroll img {
    width: 100%;
    max-width: none;
}

.navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-top: 1px solid #333;
}

.progress-bar-container {
    flex-grow: 1;
    height: 4px;
    background-color: #444;
    margin: 0 1rem;
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: rgba(100, 88, 237, 1);
    transition: width 0.3s ease;
}

.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #1a1a1a;
    z-index: 9999;
}

.reader-settings {
    position: fixed;
    top: 109px;
    right: 10px;
    padding: 1rem;
    z-index: 1000;
    width: 20vw;
    background: #333;
    color: white;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.reader-settings h3 {
    margin-top: 0;
}

.reader-settings label {
    display: block;
    margin-bottom: 0.5rem;
}

.reader-settings select,
.reader-settings input {
    width: 100%;
    margin-bottom: 1rem;
    background-color: #444;
    color: white;
    border: 1px solid #555;
    padding: 0.5rem;
}

.reader-settings input[type="range"] {
    width: 92% !important;
}

.page-transition-enter-active,
.page-transition-leave-active {
    transition: all 0.3s ease;
}

.page-transition-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.page-transition-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

/* For right-to-left reading direction */
.rtl .page-transition-enter-from {
    transform: translateX(-30px);
}

.rtl .page-transition-leave-to {
    transform: translateX(30px);
}
</style>