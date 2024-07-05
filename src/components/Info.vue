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
          <div class="rating">{{ media.rating }} ❤️</div>
        </div>
      </div>
      
      <div class="main-content">
        <p class="description">{{ media.description }}</p>
      </div>
      
      <div class="episodes-section">
        <div class="season-selector">
          <h2>Season {{ media.season }}</h2>
          <p>{{ currentEpisodes.length }} Episodes</p>
          <div class="chevron-right">›</div>
        </div>
        
        <div class="tags">
          <span 
            v-for="category in categories" 
            :key="category"
            :class="['tag', { active: currentCategory === category }]"
            @click="setCategory(category)"
          >
            {{ category }}
          </span>
        </div>
        
        <div class="episodes-list">
          <div v-for="episode in currentEpisodes" :key="episode.id" class="episode">
            <h3>{{ episode.title }}</h3>
            <p>Episode {{ episode.number }}</p>
          </div>
        </div>
      </div>
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
        currentCategory: 'Sub',
        categories: ['Sub', 'Softsub', 'Dub'],
        media: {
          secondaryTitle: 'Kimetsu no Yaiba: Hashira Geiko-h...',
          primaryTitle: 'Demon Slayer: Kimetsu no Yaiba Hashira Train...',
          status: 'Unknown',
          rating: 10.0,
          description: 'New season of Kimetsu no Yaiba.',
          season: 5,
        },
        episodes: {
          Sub: [
            { id: 1, title: 'To Defeat Muzan Kibutsuji', number: 1 },
            { id: 2, title: 'Water Hashira Giyu Tomioka`s Pain', number: 2 },
            { id: 3, title: 'Fully Recovered Tanjiro Joins the Hashira Training!!', number: 3 },
            { id: 4, title: 'To Bring a Smile to One`s Face', number: 4 },
          ],
          Softsub: [
            { id: 1, title: 'The Beginning of Hashira Training', number: 1 },
            { id: 2, title: 'Challenges Ahead', number: 2 },
            { id: 3, title: 'Unlocking New Powers', number: 3 },
          ],
          Dub: [
            { id: 1, title: 'Demon Slayer Corps Assembles', number: 1 },
            { id: 2, title: 'The Path of the Hashira', number: 2 },
          ]
        }
      }
    },
    computed: {
      currentEpisodes() {
        return this.episodes[this.currentCategory];
      }
    },
    methods: {
      setCategory(category) {
        this.currentCategory = category;
      }
    },
    mounted() {
      setTimeout(() => {
        this.loading = false
      }, 2000)
    }
  }
  </script>
  
  <style scoped>
    .media-details {
    color: white;
    font-family: Arial, sans-serif;
  }
  
  .header {
    position: relative;
    height: 400px;
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
    filter: brightness(60%) blur(5px);
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
    width: 200px;
    height: 300px;
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
    align-self: flex-start;
    margin-top: 20px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .description {
    line-height: 1.6;
  }
  
  .episodes-section {
    padding: 20px;
  }
  
  .episodes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .episode {
    background-color: #333;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .episode img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  .episode-details {
    padding: 10px;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #1a1a1a;
  }
  
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .season-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chevron-right {
  font-size: 24px;
}

.tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  padding: 5px 15px;
  border-radius: 20px;
  background-color: #333;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tag:hover {
  background-color: #444;
}

.tag.active {
  background-color: #6666ff;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.episode {
  background-color: #333;
  border-radius: 10px;
  padding: 15px;
}

.episode h3 {
  margin: 0;
  font-size: 16px;
}

.episode p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #999;
}
</style>