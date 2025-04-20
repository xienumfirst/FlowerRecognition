<template>
  <NavBar />
  <HeroSection />
  <main class="container">
    <UploadSection />
    <ResultSection />
  </main>
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import UploadSection from '../components/UploadSection.vue'
import ResultSection from '../components/ResultSection.vue'
</script>