<script>
export default {
  name: "Maintenance"
}
</script>

<template>
  <div class="maintenance">
    <div class="container px-5 py-5" style="min-height: 60vh">
        <router-link
            to="/"
        >
            <img
            class="mb-4 m-auto d-flex align-items-center"
            alt="G2P logo"
            src="../assets/G2P-logo.png"
            width="20%"
            height="auto"
            />
        </router-link>
        <h1>Website Under Maintenance</h1>
        <p>We are performing scheduled maintenance and will be back online shortly.</p>
    </div>
  </div>
</template>

<style scoped>
.maintenance {
  text-align: center;
}
</style>