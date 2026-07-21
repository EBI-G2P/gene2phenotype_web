<script>
import DeleteDraftModal from "../modal/DeleteDraftModal.vue";
export default {
  props: {
    userManualDrafts: Array,
    isDeleteDraftLoading: Boolean,
    deleteDraftStableId: String,
  },
  emits: ["deleteDraft"],
  components: {
    DeleteDraftModal,
  },
  data() {
    return {
      selectedDraftStableIdToDelete: null,
    };
  },
  methods: {
    setSelectedDraftStableIdToDelete(stableId) {
      this.selectedDraftStableIdToDelete = stableId;
    },
    clearSelectedDraftStableIdToDelete() {
      this.selectedDraftStableIdToDelete = null;
    },
    deleteSelectedDraft() {
      if (!this.selectedDraftStableIdToDelete) {
        return;
      }

      this.$emit("deleteDraft", this.selectedDraftStableIdToDelete);
      this.clearSelectedDraftStableIdToDelete();
    },
  },
};
</script>
<template>
  <div v-if="userManualDrafts?.length > 0" class="table-responsive-xl">
    <table class="table table-hover table-bordered">
      <thead>
        <tr>
          <th>Session Name</th>
          <th>G2P ID</th>
          <th>Gene</th>
          <th>Disease</th>
          <th>Allelic Requirement</th>
          <th>Mechanism</th>
          <th>Panels</th>
          <th>Last Updated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in userManualDrafts" :key="item.stable_id">
          <td>
            {{ item.session_name }}
          </td>
          <td>{{ item.stable_id }}</td>
          <td>{{ item.locus }}</td>
          <td>{{ item.disease }}</td>
          <td>{{ item.allelic_requirement }}</td>
          <td>{{ item.molecular_mechanism }}</td>
          <td>
            <span v-if="item.panels?.length > 0">
              <template v-for="(panel, index) in item.panels" :key="panel">
                {{ panel }}
                <span v-if="index !== item.panels.length - 1">, </span>
              </template>
            </span>
          </td>
          <td>{{ item.last_update }}</td>
          <td class="text-nowrap text-center">
            <router-link
              v-if="item.stable_id"
              :to="`/lgd/update-draft/${item.stable_id}`"
              style="text-decoration: none"
            >
              Update <i class="bi bi-pencil-square"></i>
            </router-link>
            <br />
            <button
              type="button"
              class="btn btn-link p-0 mb-1 d-inline-flex align-items-center justify-content-center delete-draft-button"
              style="text-decoration: none"
              :disabled="isDeleteDraftLoading"
              data-bs-toggle="modal"
              data-bs-target="#delete-draft-modal"
              @click="setSelectedDraftStableIdToDelete(item.stable_id)"
            >
              <span
                v-if="deleteDraftStableId === item.stable_id"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else>Delete <i class="bi bi-trash"></i></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <DeleteDraftModal
      :stable-id="selectedDraftStableIdToDelete"
      @delete="deleteSelectedDraft"
      @cancel="clearSelectedDraftStableIdToDelete"
    />
  </div>
  <div v-else class="alert alert-secondary" role="status">
    <i class="bi bi-info-circle-fill"></i>
    You currently have no manual drafts.
  </div>
</template>
<style scoped>
table th {
  /* Keep header text on one line */
  white-space: nowrap;
}

.delete-draft-button {
  min-width: 64px;
}
</style>
