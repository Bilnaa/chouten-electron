<template>
  <div class="media-details" v-if="!loading">
    <div class="header">
      <div class="background-image-container">
        <img src="/mountains.svg" alt="Background" class="background-image" />
      </div>
      <div class="content">
        <img src="/mountains.svg" alt="Cover" class="cover-image" />
        <div class="title-area">
          <p class="secondary-title">{{ media.secondaryTitle }}</p>
          <h1 class="primary-title">{{ media.primaryTitle }}</h1>
          <p class="status">{{ media.status }}</p>
        </div>
        <div class="rating">{{ media.rating }}</div>
      </div>
    </div>

    <div class="main-content">
      <div class="metadata">

        <div class="tags">
          <span class="tag" v-for="tag in media.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="synopsis">
          <h2>Synopsis</h2>
          <p>{{ media.synopsis }}</p>
        </div>
      </div>

      <div class="episodes-section">

        <div class="season-selector" @click="toggleSeasonModal">
          <h2>Season {{ selectedSeason }}</h2>
          <p>{{ media.episodes[selectedSeason][selectedCategory].length }} Episodes</p>
          <div class="chevron-right">›</div>
        </div>

        <div class="category-selector">
          <button 
            v-for="category in categories" 
            :key="category"
            @click="selectCategory(category)"
            :class="{ active: selectedCategory === category }"
          >
            {{ category }}
          </button>
        </div>

        <div class="episodes-list">
          <transition-group name="episode-fade" tag="div">
            <div v-for="episode in filteredEpisodes" :key="episode.id" class="episode">
              <div class="episode-info">
                <h3>{{ episode.title }}</h3>
                <p>{{ episode.releaseInfo }}</p>
              </div>
              <span class="episode-duration">{{ episode.duration }}</span>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
    <transition name="modal-fade">
      <div v-if="showSeasonModal" class="season-modal" @click.self="toggleSeasonModal">
        <transition name="modal-scale">
          <div v-if="showSeasonModal" class="season-modal-content">
            <transition-group name="list-complete" tag="div">
              <h2 v-for="season in seasons" 
                  :key="season" 
                  @click="selectSeason(season)"
                  :class="{ 'selected': season === selectedSeason }"
                  class="list-complete-item">
                Season {{ season }}
              </h2>
            </transition-group>
            <button class="close-button" @click="toggleSeasonModal">×</button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
  <div v-else class="loading">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      selectedCategory: 'Sub',
      categories: ['Sub', 'Softsub'],
      selectedSeason: 1,
      showSeasonModal: false,
      seasons: [1, 2],
      media: {
        secondaryTitle: 'Placeholder Series',
        primaryTitle: '[Placeholder] 2nd Season',
        status: 'Ongoing',
        rating: '10.0',
        format: 'TV Series',
        episodeCount: 13,
        tags: ['Summer 2024', 'Releasing', 'Manga','Drama', 'Mystery', 'Psychological', 'Supernatural'],
        synopsis: 'This is a placeholder synopsis for the second season of a fictional show. It involves characters navigating complex situations in a unique setting.',
        season: 2,
        episodes: {
          1: {
            Sub: [
              { id: 1, title: 'Tokyo Blade', releaseInfo: 'Episode 1', duration: '24m' },
            ],
            Softsub: [
              { id: 1, title: 'Tokyo Blade (Softsub)', releaseInfo: 'Episode 1', duration: '24m' },
            ]
          },
          2: {
            Sub: [
              { id: 1, title: 'Season 2 Episode 1', releaseInfo: 'Episode 1', duration: '24m' },
            ],
            Softsub: [
              { id: 1, title: 'Season 2 Episode 1 (Softsub)', releaseInfo: 'Episode 1', duration: '24m' },
            ]
          }
        }
      }
    }
  },
  computed: {
    filteredEpisodes() {
      return this.media.episodes[this.selectedSeason][this.selectedCategory]
    }
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category
    },
    toggleSeasonModal() {
      this.showSeasonModal = !this.showSeasonModal;
      
      if (this.showSeasonModal) {
        this.$nextTick(() => {
          const items = this.$el.querySelectorAll('.list-complete-item');
          items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.05}s`;
          });
        });
      }
    },
    selectSeason(season) {
      this.selectedSeason = season;
      
      const selectedItem = this.$el.querySelector('.selected');
      selectedItem.style.transform = 'scale(1.1)';
      setTimeout(() => {
        selectedItem.style.transform = 'scale(1)';
      }, 300);
      
      setTimeout(() => {
        this.toggleSeasonModal();
      }, 500);

      this.$nextTick(() => {
        const episodes = this.$el.querySelectorAll('.episode');
        episodes.forEach((episode, index) => {
          episode.style.transitionDelay = `${index * 0.05}s`;
        });
      });
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 2000)
    console.log(JSON.stringify(this.media.episodes))
  }
}
</script>

<style scoped>
.media-details {
  color: #ffffff;
  font-family: Arial, sans-serif;
}

.header {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(50%) blur(5px);
}

.content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: flex-end;
}

.cover-image {
  width: 150px;
  height: 225px;
  object-fit: cover;
  border-radius: 10px;
  margin-right: 20px;
}

.title-area {
  flex-grow: 1;
}

.secondary-title {
  font-size: 18px;
  margin-bottom: 5px;
}

.primary-title {
  font-size: 36px;
  margin-bottom: 5px;
}

.status {
  color: #a855f7;
  font-size: 16px;
}

.rating {
  font-size: 24px;
  margin-top: 20px;
}

.main-content {
  display: flex;
  padding: 20px;
}

.metadata {
  flex: 1;
  margin-right: 40px;
}

.info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag, .genre {
  background-color: #333;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
}

.synopsis h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.episodes-section {
  flex: 1;
}

.category-selector {
display: flex;
margin-bottom: 20px;
}

.category-selector button {
background-color: transparent;
border: none;
color: #ffffff;
padding: 10px 20px;
cursor: pointer;
font-size: 16px;
}

.category-selector button.active {
background-color: #333;
border-radius: 20px;
}

.episodes-list {
display: flex;
flex-direction: column;
gap: 10px;
max-height: 400px;
overflow-y: auto;
}

.episode {
display: flex;
justify-content: space-between;
align-items: center;
background-color: #1e1e1e;
padding: 15px;
border-radius: 5px;
}

.episode-info h3 {
margin: 0;
font-size: 16px;
}

.episode-info p {
margin: 5px 0 0;
font-size: 14px;
color: #999;
}

.episode-duration {
font-size: 14px;
color: #999;
}

.chevron-right {
  font-size: 24px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 4px solid #333;
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.season-modal-content h2.selected {
color: #a855f7;
}

.close-button {
position: absolute;
bottom: -60px;
left: 50%;
transform: translateX(-50%);
background-color: #ffffff;
color: #000000;
border: none;
border-radius: 50%;
width: 40px;
height: 40px;
font-size: 24px;
cursor: pointer;
display: flex;
justify-content: center;
align-items: center;
}

.season-selector {
display: flex;
justify-content: space-between;
align-items: center;
background-color: rgba(255, 255, 255, 0.05);
padding: 15px 20px;
border-radius: 10px;
margin-bottom: 10px;
cursor: pointer;
transition: background-color 0.3s ease, transform 0.3s ease;
}

.season-selector:hover {
background-color: rgba(255, 255, 255, 0.1);
}

.season-selector:active {
transform: scale(0.98);
}

.season-selector.active {
background-color: rgba(255, 255, 255, 0.15);
}

.season-info {
display: flex;
flex-direction: column;
}

.season-info h2 {
margin: 0;
font-size: 18px;
}

.season-info p {
margin: 5px 0 0;
font-size: 14px;
color: #999;
}

.chevron-right {
font-size: 24px;
transition: transform 0.3s ease;
}

.chevron-right.rotate {
transform: rotate(90deg);
}

@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.05); }
100% { transform: scale(1); }
}

.season-selector:active .chevron-right {
animation: pulse 0.3s ease;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.season-modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.8);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.season-modal-content {
background-color: #1e1e1e;
padding: 20px;
border-radius: 10px;
width: 80%;
max-width: 300px;
position: relative;
}

.season-modal-content h2 {
color: #ffffff;
padding: 10px 0;
cursor: pointer;
transition: color 0.3s ease, transform 0.3s ease;
}

.season-modal-content h2:hover {
transform: translateX(10px);
}

.season-modal-content h2.selected {
color: #a855f7;
}

.close-button {
position: absolute;
bottom: -60px;
left: 50%;
transform: translateX(-50%);
background-color: #ffffff;
color: #000000;
border: none;
border-radius: 50%;
width: 40px;
height: 40px;
font-size: 24px;
cursor: pointer;
display: flex;
justify-content: center;
align-items: center;
transition: background-color 0.3s ease, transform 0.3s ease;
}

.close-button:hover {
background-color: #e0e0e0;
transform: translateX(-50%) scale(1.1);
}

.modal-fade-enter-active, .modal-fade-leave-active {
transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
opacity: 0;
transform: translateY(-20px);
}

.modal-scale-enter-active, .modal-scale-leave-active {
transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}
.modal-scale-enter-from, .modal-scale-leave-to {
opacity: 0;
transform: scale(0.9) translateY(20px);
}

.list-complete-item {
transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
display: block;
}

.list-complete-enter-from,
.list-complete-leave-to {
opacity: 0;
transform: translateY(30px) rotateX(90deg);
}

.list-complete-leave-active {
position: absolute;
}


.episode-fade-enter-active,
.episode-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.episode-fade-enter-from,
.episode-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}


.episode {
transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}
</style>