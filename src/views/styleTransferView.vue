<template>
  <NavBar />
  <HeroSection />
  <style-transfer />
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import StyleTransfer from '../components/StyleTransfer.vue';
</script>




<style scoped>
.style-transfer-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
}
</style>


