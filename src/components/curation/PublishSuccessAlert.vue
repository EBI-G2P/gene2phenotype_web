<script>
export default {
  props: {
    successMsg: String,
    stableId: String
  },
  methods: {
    refreshCurrentPage() {
      this.$router.go();
    },
  },
};
</script>
<template>
  <div
    class="alert alert-success mx-auto col-6"
    style="margin-top: 50px"
    role="alert"
  >
    <h4 class="alert-heading">
      <i
        class="bi bi-check-circle-fill"
        style="color: green; margin-right: 10px"
      ></i>
      Success
    </h4>
    <p>{{ successMsg }}</p>
    </hr>
    <div class="d-flex justify-content-between">
        <router-link :to="`/lgd/${stableId}`" class="btn btn-primary me-3">
            View New G2P Record
        </router-link>
        <button class="btn btn-primary" @click="refreshCurrentPage">
            Add Another G2P Record
        </button>
    </div>
  </div>
</template>
