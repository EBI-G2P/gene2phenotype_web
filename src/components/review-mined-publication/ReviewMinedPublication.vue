<script>
import api from "../../services/api.js";
import {
  EUROPE_PMC_URL,
  UPDATE_MINED_PUBLICATION_URL,
} from "../../utility/UrlConstants.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";
import { MINED_PUBLICATION_STATUS } from "../../utility/Constants.js";

export default {
  props: {
    stableId: String,
    currentMinedPublications: Array,
  },
  data() {
    return {
      minedPublicationsInput: this.getMinedPublicationsInput(
        this.currentMinedPublications
      ),
      isUpdateApiCallLoading: false,
      updateDataErrorMsg: null,
      isUpdateDataSuccess: false,
      updateDataSuccessMsg: null,
      EUROPE_PMC_URL,
      MINED_PUBLICATION_STATUS,
    };
  },
  computed: {
    isDisableSubmitBtn() {
      return Object.values(this.minedPublicationsInput).every(
        (item) => !item.isRejected
      );
    },
  },
  methods: {
    getMinedPublicationsInput(currentMinedPublications) {
      // minedPublicationsInput is an object used to track user input of mined publications that are yet to be reviewed (status - 'mined')
      // structure of minedPublicationsInput = {
      //   pmid: {
      //     isRejected: true/false,
      //     comment: "",
      //   },
      // };
      let minedPublicationsInput = {};
      currentMinedPublications
        .filter((item) => item.status === MINED_PUBLICATION_STATUS.MINED)
        .forEach((item) => {
          minedPublicationsInput[item.pmid] = {
            isRejected: false,
            comment: "",
          };
        });
      return minedPublicationsInput;
    },
    updateData() {
      this.updateDataErrorMsg = this.updateDataSuccessMsg = null;
      this.isUpdateDataSuccess = false;
      this.isUpdateApiCallLoading = true;
      const requestBody = {
        mined_publications: this.prepareRequestData(
          this.minedPublicationsInput
        ),
      };
      api
        .put(
          UPDATE_MINED_PUBLICATION_URL.replace(":stableid", this.stableId),
          requestBody
        )
        .then((response) => {
          this.updateDataSuccessMsg = response.data.message;
        })
        .catch((error) => {
          this.updateDataErrorMsg = fetchAndLogApiResponseErrorMsg(
            error,
            error?.response?.data?.error,
            "Unable to update mined publications. Please try again later.",
            "Unable to update mined publications."
          );
        })
        .finally(() => {
          this.isUpdateApiCallLoading = false;
        });
    },
    prepareRequestData(minedPublicationsInput) {
      // From minedPublicationsInput, prepare list of rejected mined publications
      let minedPublicationsList = [];
      for (const [pmid, valueObj] of Object.entries(minedPublicationsInput)) {
        if (valueObj.isRejected) {
          minedPublicationsList.push({
            pmid: pmid,
            status: MINED_PUBLICATION_STATUS.REJECTED,
            comment: valueObj.comment,
          });
        }
      }
      return minedPublicationsList;
    },
  },
};
</script>
<template>
  <div
    v-if="isUpdateApiCallLoading"
    class="d-flex justify-content-center"
    style="margin-top: 122px; margin-bottom: 122px"
  >
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div
    class="alert alert-success mt-3"
    role="alert"
    v-else-if="updateDataSuccessMsg"
  >
    <div>
      <i class="bi bi-check-circle-fill"></i>
      {{ updateDataSuccessMsg }}
    </div>
  </div>
  <div v-else>
    <h5>Mined publications available for review</h5>
    <table class="table table-bordered table-info">
      <thead>
        <tr>
          <th width="10%">PMID</th>
          <th width="44%">Title</th>
          <th width="8%">Curate</th>
          <th width="8%">Status</th>
          <th width="30%">Comment</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in currentMinedPublications">
          <td>
            <a
              v-if="item.pmid"
              :href="EUROPE_PMC_URL + item.pmid"
              style="text-decoration: none"
              target="_blank"
            >
              {{ item.pmid }}
            </a>
          </td>
          <td>
            {{ item.title }}
          </td>
          <template v-if="item.status === MINED_PUBLICATION_STATUS.MINED">
            <td>
              <a
                :href="`/gene2phenotype/lgd/add-publication/${stableId}?publication=${item.pmid}`"
                class="btn btn-primary"
                style="text-decoration: none"
                target="_blank"
              >
                Curate
              </a>
            </td>
            <td>
              <div class="form-check">
                <input
                  :id="`input-reject-checkbox-${item.pmid}`"
                  class="form-check-input"
                  type="checkbox"
                  v-model="minedPublicationsInput[item.pmid].isRejected"
                />
                <label
                  class="form-check-label"
                  :for="`input-reject-checkbox-${item.pmid}`"
                >
                  Reject
                </label>
              </div>
            </td>
            <td>
              <textarea
                :id="`input-comment-${item.pmid}`"
                class="form-control"
                rows="3"
                type="text"
                v-model="minedPublicationsInput[item.pmid].comment"
              >
              </textarea>
            </td>
          </template>
          <template v-else>
            <td>
              <span v-if="item.status === MINED_PUBLICATION_STATUS.CURATED"
                >Curated</span
              >
            </td>
            <td>
              <span v-if="item.status === MINED_PUBLICATION_STATUS.REJECTED"
                >Rejected</span
              >
            </td>
            <td>
              {{ item.comment }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-end">
      <button
        type="button"
        class="btn btn-primary"
        @click="updateData"
        :disabled="isDisableSubmitBtn"
      >
        <i class="bi bi-send-fill"></i> Submit review
      </button>
    </div>
  </div>
  <div v-if="updateDataErrorMsg" class="alert alert-danger mt-3" role="alert">
    <div>
      <i class="bi bi-exclamation-circle-fill"></i>
      {{ updateDataErrorMsg }}
    </div>
  </div>
</template>
