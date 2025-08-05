<script>
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import { UPDATE_COMMENT_URL } from "../../utility/UrlConstants.js";
import api from "../../services/api.js";
import DeleteCommentModal from "../modal/DeleteCommentModal.vue";

export default {
  props: {
    stableId: String,
    currentComments: Array,
  },
  data() {
    return {
      comments: this.currentComments,
      commentToDelete: null,
      deleteApiCallErrorMsg: null,
      isDeleteApiCallLoading: false,
      isDeleteApiCallSuccess: false,
      deleteApiCallSuccessMsg: null,
    };
  },
  components: {
    DeleteCommentModal,
  },
  methods: {
    deleteComment() {
      if (!this.commentToDelete) {
        return;
      }
      this.deleteApiCallErrorMsg = this.deleteApiCallSuccessMsg = null;
      this.isDeleteApiCallSuccess = false;
      this.isDeleteApiCallLoading = true;
      const requestBody = {
        comment: this.commentToDelete,
      };
      api
        .patch(
          UPDATE_COMMENT_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.isDeleteApiCallSuccess = true;
          this.deleteApiCallSuccessMsg = response.data.message;
          // Remove the deleted delete from comments list
          this.comments = this.comments.filter(
            (item) => item.text !== this.commentToDelete
          );
          // Clear commentToDelete
          this.clearCommentToDelete();
        })
        .catch((error) => {
          this.deleteApiCallErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to delete comment. Please try again later.",
            "Unable to delete comment."
          );
        })
        .finally(() => {
          this.isDeleteApiCallLoading = false;
        });
    },
    setCommentToDelete(commentText) {
      // Set commentToDelete
      this.commentToDelete = commentText;
    },
    clearCommentToDelete() {
      // Clear commentToDelete
      this.commentToDelete = null;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="update-comment-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#update-comment-section-body"
          aria-expanded="false"
          aria-controls="update-comment-section-body"
        >
          Comments
          <span
            class="badge rounded-pill text-bg-success mx-2"
            v-if="isDeleteApiCallSuccess"
          >
            <i class="bi bi-check-circle-fill"></i> Updated
          </span>
        </button>
      </h2>
      <div id="update-comment-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <div class="row g-3 p-2">
            <h5>Comments</h5>
            <div
              class="d-flex justify-content-center"
              v-if="isDeleteApiCallLoading"
              style="margin-top: 122px; margin-bottom: 122px"
            >
              <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <table v-if="comments?.length > 0" class="table table-bordered">
                <thead>
                  <tr>
                    <th>Comment</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in comments" :key="item.text">
                    <td>{{ item.text }} ({{ item.date }})</td>
                    <td>
                      {{
                        item.is_public === 1
                          ? "Public"
                          : item.is_public === 0
                          ? "Private"
                          : ""
                      }}
                    </td>
                    <td>
                      <button
                        class="btn btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-comment-modal"
                        @click="setCommentToDelete(item.text)"
                      >
                        <i class="bi bi-trash-fill"></i> Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else>
                <i class="bi bi-info-circle"></i> No comments available for this
                record.
              </p>
            </div>
            <div
              class="alert alert-danger mt-3"
              role="alert"
              v-if="deleteApiCallErrorMsg"
            >
              <div>
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ deleteApiCallErrorMsg }}
              </div>
            </div>
            <div
              class="alert alert-success mt-3"
              role="alert"
              v-if="isDeleteApiCallSuccess"
            >
              <div>
                <i class="bi bi-check-circle-fill"></i>
                {{ deleteApiCallSuccessMsg }}
              </div>
            </div>
          </div>
          <DeleteCommentModal
            @cancel="clearCommentToDelete"
            @delete="deleteComment"
          />
        </div>
      </div>
    </div>
  </div>
</template>
