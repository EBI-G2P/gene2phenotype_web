<script setup>
import { RouterView } from "vue-router";
import Footer from "./components/footer/Footer.vue";
import Header from "./components/header/Header.vue";
import HeaderWithoutSearch from "./components/header/HeaderWithoutSearch.vue";
</script>

<template>
  <HeaderWithoutSearch v-if="$route.path === '/'" />
  <Header v-else />
  <RouterView />
  <Footer />
</template>
