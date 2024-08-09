<script>
export default {
  props: {
    errorMsg: String,
    stableId: String,
  },
  methods: {
    refreshCurrentPage() {
      this.$router.go();
    },
    redirectToPage() {
      this.$router.push(`/lgd/update/${this.stableId}`);
    },
  },
};
</script>
<template>
  <div
    class="alert alert-danger mx-auto col-6"
    style="margin-top: 50px"
    role="alert"
  >
    <h4 class="alert-heading">
      <i
        class="bi bi-check-circle-fill"
        style="color: blue; margin-right: 10px"
      ></i>
      Info
    </h4>
    <p>{{ errorMsg }}</p>
    <hr />
    <div ckass="d-flex justify-content-between">
      <button class="btn btn-primary me-3" @click="redirectToPage">
        Update Current Record
      </button>
      <button class="btn btn-primary" @click="refreshCurrentPage">
        Add Another G2P Record
      </button>
    </div>
  </div>
</template>
