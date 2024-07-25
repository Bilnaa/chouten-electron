<template>
  <router-link class="numbered-item" :to="'/infos?url='+url">
   <div class="content">
     <div class="image-placeholder">
       <img :src="poster" :alt="titles.primary" class="placeholder-image">
     </div>
     <div class="text-content">
       <span class="title">{{ titles.primary }}</span>
       <span class="count">{{ current }}/{{ total }}</span> 
     </div>
   </div>
   <span class="number">{{ indicator }}</span>
 </router-link>
</template>

<script>
export default {
 name: 'NumberedItem',
 props: {
   url: String,
   poster: String,
   titles: Object,
   indicator: String,
   current: Number,
   total: Number
 },
 setup(props) {
  let truncatedTitles = props.titles
  if (props.titles.primary.length > 50) {
    truncatedTitles.primary = props.titles.primary.substring(0, 50) + '...'
  }
   return {
     titles: truncatedTitles,
   }
  }
}
</script>

<style scoped>


.numbered-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  max-width: 34vw;
  min-width: 20vw;
  overflow: hidden;
}



.image-placeholder {
  width: 50px;
  height: 50px;
  background-color: #333;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.content {
  display: flex;
  flex-direction: row;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center
}

.title {
  font-size: 14px;
  color: #ffffff;
  opacity: 0.7;
}

.count {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.5;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-left: auto;
}
</style>