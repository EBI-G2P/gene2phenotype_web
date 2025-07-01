<script setup>
import { RouterView } from "vue-router";
import Footer from "./components/footer/Footer.vue";
import Header from "./components/header/Header.vue";
import HeaderWithoutSearch from "./components/header/HeaderWithoutSearch.vue";
</script>

<template>
  <!-- Survey banner start -->
  <div
    class="alert alert-light mb-0 text-center p-2"
    style="font-size: 12px"
    role="alert"
  >
    We need your help! Has Gene2Phenotype saved you time or effort? Please take
    15 minutes to fill in a survey and help EMBL-EBI make the case for why open
    data resources are critical to life science research. <br />
    <a
      href="https://www.surveymonkey.com/r/QGFMBH8?channel=[webpage]"
      class="alert-link"
      target="_blank"
      >https://www.surveymonkey.com/r/QGFMBH8?channel=[webpage]
    </a>
  </div>
  <!-- Survey banner end -->
  <HeaderWithoutSearch v-if="$route.path === '/'" />
  <Header v-else />
  <RouterView />
  <Footer />
</template>
