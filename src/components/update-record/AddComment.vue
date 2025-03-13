<script>
import api from "../../services/api.js";
import { ADD_COMMENT_URL } from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";

export default {
  props: {
    stableId: String,
  },
  data() {
    return {
      publicComment: "",
      privateComment: "",
      isApiCallLoading: false,
      apiErrorMsg: null,
      isAddCommentSuccess: false,
      addCommentSuccessMsg: null,
    };
  },
  methods: {
    addComment() {
      this.apiErrorMsg = this.addCommentSuccessMsg = null;
      this.isAddCommentSuccess = false;
      this.isApiCallLoading = true;
      let inputComments = [];
      if (this.publicComment) {
        inputComments.push({
          comment: this.publicComment,
          is_public: 1,
        });
      }
      if (this.privateComment) {
        inputComments.push({
          comment: this.privateComment,
          is_public: 0,
        });
      }
      const requestBody = {
        comments: inputComments,
      };
      api
        .post(ADD_COMMENT_URL.replace(":stableid", this.stableId), requestBody)
        .then((response) => {
          this.isAddCommentSuccess = true;
          this.addCommentSuccessMsg = response.data.message;
          // clear comments
          this.publicComment = "";
          this.privateComment = "";
        })
        .catch((error) => {
          this.apiErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to submit comments. Please try again later.",
            "Unable to submit comments."
          );
        })
        .finally(() => {
          this.isApiCallLoading = false;
        });
    },
  },
};
</script>
<template>
  <p class="pt-2">
    <i class="bi bi-info-circle"></i> After updating data, use the form below to
    submit any additional comments.
  </p>
  <hr />
  <h5>Comments</h5>
  <div
    class="d-flex justify-content-center"
    v-if="isApiCallLoading"
    style="margin-top: 122px; margin-bottom: 122px"
  >
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div v-else>
    <div class="pb-3">
      <label for="private-comment-input" class="form-label">
        Private comment
      </label>
      <textarea
        class="form-control"
        id="private-comment-input"
        rows="3"
        type="text"
        v-model="privateComment"
      >
      </textarea>
    </div>
    <div class="pb-3">
      <label for="public-comment-input" class="form-label">
        Public comment
      </label>
      <textarea
        class="form-control"
        id="public-comment-input"
        rows="3"
        type="text"
        v-model="publicComment"
      >
      </textarea>
    </div>
    <button type="button" class="btn btn-primary" @click="addComment">
      <i class="bi bi-pencil-square"></i> Submit comment
    </button>
  </div>
  <div class="alert alert-danger mt-3" role="alert" v-if="apiErrorMsg">
    <div>
      <i class="bi bi-exclamation-circle-fill"></i>
      {{ apiErrorMsg }}
    </div>
  </div>
  <div class="alert alert-success mt-3" role="alert" v-if="isAddCommentSuccess">
    <div>
      <i class="bi bi-check-circle-fill"></i>
      {{ addCommentSuccessMsg }}
    </div>
  </div>
</template>
