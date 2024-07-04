<template>
  <div class="card">
    <img src="/mountains.svg" alt="Mountains" />
    <div class="card-content">
      <p class="secondary">Secondary</p>
      <div class="primary-row">
        <h2 class="primary">Primary</h2>
        <div class="card-footer">
          <span>Text</span>
          <span class="heart">❤️</span>
        </div>
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
    width: 55vw;
    height: 50vh;
    max-height: fit-content;
    background-color: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
}

.card img {
  object-fit: cover;
}

.card-content {
  width: 60%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.secondary {
  color: #888;
  font-size: 14px;
  margin-bottom: 4px;
}

.primary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.primary {
  font-size: 24px;
  color: #fff;
  margin: 0;
}

.description {
  color: #bbb;
  font-size: 14px;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  align-items: center;
}

.card-footer span {
  color: #fff;
  font-size: 14px;
  margin-right: 5px;
}

.heart {
  color: #ff0000;
}
</style>