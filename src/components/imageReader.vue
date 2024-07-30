<template>
    <div class="reader-container" :class="{ fullscreen: isFullscreen }">
      <div class="settings-panel">
        <button @click="toggleFullscreen" class="icon-button">
          <FullscreenIcon :size="24" />
        </button>
        <div class="page-display">
          <span>{{ bookTitle }} - {{ chapterTitle }}</span>
          <br>
          <span>Pg. {{ currentPage + 1 }} / {{ totalPages }}</span>
        </div>
        <button @click="toggleSettings" class="icon-button">
          <CogIcon :size="24" />
        </button>
      </div>
  
      <div class="image-container" :class="[currentStyle.class]" @wheel="handleWheel" ref="imageContainer">
      <template v-if="currentStyle.value === 'single'">
        <img :src="visibleImages[0]" :alt="`Page ${currentPage + 1}`" :style="{ transform: `scale(${zoomLevel})` }" />
      </template>
      <template v-else-if="currentStyle.value === 'double'">
        <img v-for="(image, index) in visibleImages" :key="index" :src="image" :alt="`Page ${currentPage * 2 + index + 1}`" :style="{ transform: `scale(${zoomLevel})` }" />
      </template>
      <template v-else-if="currentStyle.value === 'long-strip' || currentStyle.value === 'vertical-scroll'">
        <div :class="currentStyle.value === 'vertical-scroll' ? 'vertical-scroll' : 'long-strip'">
          <img v-for="(image, index) in images" :key="index" :src="image" :alt="`Page ${index + 1}`" :style="{ transform: `scale(${zoomLevel})` }" />
        </div>
      </template>
    </div>
  
      <div class="navigation">
        <button @click="previousPage" :disabled="currentPage === 0" class="icon-button">
          <ArrowLeftIcon :size="24" />
        </button>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="icon-button">
          <ArrowRightIcon :size="24" />
        </button>
      </div>
  
      <div class="thumbnail-view">
        <img v-for="(image, index) in images" 
             :key="index" 
             :src="image" 
             :alt="`Thumbnail ${index + 1}`" 
             @click="goToPage(index)" 
             :class="{ active: index === currentPage }" />
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
        <select v-model="readingDirection" id="reading-direction">
          <option value="ltr">Left to Right</option>
          <option value="rtl">Right to Left</option>
        </select>
  
        <label for="zoom-level">Zoom Level:</label>
        <input type="range" v-model="zoomLevel" min="0.5" max="3" step="0.1" id="zoom-level">
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
    setup() {
      const bookTitle = ref('Sample Book Title');
      const chapterTitle = ref('Chapter 1');
      const selectedStyle = ref('single');
      const readingDirection = ref('ltr');
      const currentPage = ref(0);
      const zoomLevel = ref(1);
      const isFullscreen = ref(false);
      const showSettings = ref(false);
      const imageContainer = ref(null);
      const images = ref([
        'https://placehold.co/600x800?text=Page+1',
        'https://placehold.co/600x800?text=Page+2',
        'https://placehold.co/600x800?text=Page+3',
        'https://placehold.co/600x800?text=Page+4',
        'https://placehold.co/600x800?text=Page+5',
      ]);
  
      const availableStyles = [
        { value: 'single', label: 'Single Page', class: 'single-page' },
        { value: 'double', label: 'Double Page', class: 'double-page' },
        { value: 'vertical-scroll', label: 'Vertical Scroll', class: 'vertical-scroll' },
      ];
  
      const currentStyle = computed(() => {
        return availableStyles.find(style => style.value === selectedStyle.value);
      });
  
      const totalPages = computed(() => {
        if (currentStyle.value.value === 'vertical-scroll') {
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
            nextPage();
            break;
          case 'ArrowUp':
            previousPage();
            break;
        }
      }
  
    function handleWheel(event) {
      if ((event.ctrlKey || event.metaKey) && event.deltaY !== 0) {
        event.preventDefault();
        adjustZoom(event.deltaY > 0 ? -0.1 : 0.1);
      } else if (currentStyle.value.value !== 'vertical-scroll' && currentStyle.value.value !== 'long-strip') {
        event.preventDefault();
        if (event.deltaY > 0) {
        nextPage();
        } else {
        previousPage();
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
  
      onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', () => {
          isFullscreen.value = !!document.fullscreenElement;
        });
      });
  
      onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
      });
  
      watch(selectedStyle, (newStyle, oldStyle) => {
      if (newStyle === 'vertical-scroll' || newStyle === 'long-strip') {
        currentPage.value = 0;
        nextTick(() => {
          if (imageContainer.value) {
            imageContainer.value.scrollTop = 0;
          }
        });
      }
    });
  
      return {
        bookTitle,
        chapterTitle,
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
        nextPage,
        previousPage,
        handleWheel,
        toggleFullscreen,
        goToPage,
        toggleSettings,
      };
    },
  };
  </script>
  
  <style scoped>
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
  align-items: flex-start;  /* Change from center to flex-start */
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  height: calc(100vh - 120px);  /* Adjust based on your header and footer height */
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
  
  .long-strip, .vertical-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  width: 100%;
  max-width: 800px;  /* Adjust as needed */
  margin: 0 auto;
}
  
.long-strip img, .vertical-scroll img {
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  object-fit: contain;
}
  
  .navigation {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-top: 1px solid #333;
  }
  
  .thumbnail-view {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
    border-top: 1px solid #333;
  }
  
  .thumbnail-view img {
    width: 40px;
    height: 60px;
    margin-right: 0.5rem;
    cursor: pointer;
    border: 2px solid transparent;
  }
  
  .thumbnail-view img.active {
    border-color: #fff;
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
  
  .reader-settings{
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
  
  </style>