<script>
import { SEARCH_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import { logGeneralErrorMsg } from "../../utility/ErrorUtility.js";
export default {
  props: {
    gene: String,
    mechanism: String,
    allelicRequirement: String,
  },
  emits: ["publish"],
  data() {
    return {
      duplicateRecords: null,
      isDataLoading: true,
    };
  },
  methods: {
    fetchDuplicateRecords() {
      this.duplicateRecords = null;
      this.isDataLoading = true;
      if (this.allelicRequirement && this.mechanism) {
        let url;
        if (this.mechanism === "undetermined") {
          // If mechanism is "undetermined" then it should match any mechanism so we dont provide the mechanism filter to the search API
          url = `${SEARCH_URL}?type=gene&query=${this.gene}&genotype=${this.allelicRequirement}`;
        } else {
          // If mechanism is not "undetermined" then we provide the mechanism filter to the search API
          url = `${SEARCH_URL}?type=gene&query=${this.gene}&genotype=${this.allelicRequirement}&mechanism=${this.mechanism}`;
        }
        api
          .get(url)
          .then((response) => {
            this.duplicateRecords = response.data;
            // The Search API returns paginated results when there are many records.
            // Pagination is not currently handled in this component.
            // TODO: Add pagination handling.
          })
          .catch((error) => {
            if (error.response?.status !== 404) {
              logGeneralErrorMsg(error);
            }
            // If an error occurs, the message is not currently displayed.
            // TODO: Display error messages to the user if needed.
          })
          .finally(() => {
            this.isDataLoading = false;
          });
      } else {
        // If either allelicRequirement or mechanism is not provided, we skip the API call
        this.isDataLoading = false;
      }
    },
    resetState() {
      this.duplicateRecords = null;
      this.isDataLoading = true;
    },
  },
  mounted() {
    this.modalElement = document.getElementById("publish-entry-modal");
    // Add event listener to fetch duplicate records once the modal is visible
    this.modalElement?.addEventListener(
      "shown.bs.modal",
      this.fetchDuplicateRecords,
    );
    // Add event listener to reset state when the modal is closed
    this.modalElement?.addEventListener("hidden.bs.modal", this.resetState);
  },
  beforeUnmount() {
    // Remove event listeners when the component is unmounted
    this.modalElement?.removeEventListener(
      "shown.bs.modal",
      this.fetchDuplicateRecords,
    );
    this.modalElement?.removeEventListener("hidden.bs.modal", this.resetState);
  },
};
</script>
<template>
  <div
    id="publish-entry-modal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="publish-entry-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="publish-entry-modal-label">
            Publish record
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div
            v-if="isDataLoading"
            class="d-flex justify-content-center"
            style="margin-top: 122px; margin-bottom: 122px"
          >
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else class="px-3">
            <div v-if="duplicateRecords?.results?.length > 0">
              <h6 v-if="mechanism === 'undetermined'" class="py-3">
                One or more diseases with matching gene and allelic requirement
                are already present:
              </h6>
              <h6 v-else class="py-3">
                One or more diseases with matching gene, allelic requirement and
                mechanism are already present:
              </h6>
              <div class="table-responsive-xl pb-3">
                <table class="table table-hover table-bordered">
                  <thead>
                    <tr>
                      <th>Disease</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in duplicateRecords.results"
                      :key="item.stable_id"
                    >
                      <td>
                        {{ item.disease }}
                      </td>
                      <td class="text-nowrap">
                        <router-link
                          v-if="item.stable_id"
                          :to="`/lgd/${item.stable_id}`"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          View record <i class="bi bi-box-arrow-up-right"></i>
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <hr />
            </div>
            <p class="py-3">
              You are about to publish this record. Are you sure you want to
              proceed?
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button
            @click="$emit('publish')"
            :disabled="isDataLoading"
            data-bs-dismiss="modal"
            type="button"
            class="btn btn-success"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
