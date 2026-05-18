<script>
export default {
  props: {
    successMsg: String,
    showAddButton: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    redirectToAddG2pPage() {
      if (this.$route.name === "add-g2p-record") {
        // If user is on add g2p record page then reload current page
        this.$router.go();
      } else if (this.$route.name === "update-g2p-record-draft") {
        // If user is on update g2p record draft page then redirect to add g2p record page
        this.$router.push("/lgd/add");
      }
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
      >
      </i>
      Success
    </h4>
    <p>{{ successMsg }}</p>
    <hr />
    <div class="d-flex justify-content-between">
      <router-link to="/curation/entries" class="btn btn-primary me-3">
        View All Saved Drafts
      </router-link>
      <button
        v-if="showAddButton"
        class="btn btn-primary"
        @click="redirectToAddG2pPage"
      >
        Add Another G2P Record
      </button>
    </div>
  </div>
</template>
