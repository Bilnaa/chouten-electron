<template>
  <div class="card">
    <img src="/mountains.svg" alt="Mountains" />
    <div class="card-content">
      <div class="card-action">
        <div class="infos">
          <p class="secondary">Secondary</p>
          <h2 class="primary">Primary</h2>
        </div>
        <!-- <div class="actions">
          <span>Like</span>
          <span class="heart">❤️</span>
        </div> -->
    </div>
    <p class="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc semper urna enim, quis blandit elit sodales et. Morbi quis tortor a velit ultricies elementum. Morbi auctor vitae risus sed fermentum.</p>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Card'
}
</script>

<style scoped>
.card {
  display: flex;
  width: 100%;
  max-width: 800px;
  background-color: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
}

.card img {
  width: 50%;
  object-fit: cover;
}

.card-content {
  width: 50%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.secondary {
  color: #888;
  margin-bottom: 5px;
}

.primary {
  font-size: 24px;
  color: #fff;
  margin-top: 0;
  margin-bottom: 10px;
}

.description {
  color: #bbb;
  font-size: 14px;
  line-height: 1.4;
}

.card-action {
  display: flex;
  
}

.card-action span {
  color: #fff;
  margin-right: 5px;
}

.heart {
  font-size: 18px;
}
</style>