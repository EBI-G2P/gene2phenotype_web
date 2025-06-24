<script>
import api from "../../services/api.js";
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../../utility/Constants.js";
import { SEARCH_URL } from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { useAuthStore } from "../../store/auth.js";
import { fetchAndLogGeneralErrorMsg } from "../../utility/ErrorUtility.js";

export default {
  props: {
    gene: String,
    geneSearchBtnClickHandler: Function,
    notifyExistingGeneInformation: Boolean,
  },
  emits: ["setNotifyExistingGeneInformation"],
  watch: {
    // whenever the prop notifyExistingGeneInformation changes, this function will run
    notifyExistingGeneInformation: {
      handler(newNotifyExistingGeneInformation) {
        // IF newNotifyExistingGeneInformation === true,
        // it means the parent component notified this component to fetch existing data for gene
        // THEN reset newNotifyExistingGeneInformation and fetch existing data for gene
        if (newNotifyExistingGeneInformation === true) {
          this.$emit("setNotifyExistingGeneInformation", false);
          this.fetchExistingGeneDrafts();
          this.fetchExistingGeneRecords();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      isGeneExistingDraftsDataLoading: false,
      isGeneExistingRecordsDataLoading: false,
      geneExistingDrafts: null,
      geneExistingRecords: null,
      geneExistingDraftsErrorMsg: null,
      geneExistingRecordsErrorMsg: null,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
    };
  },
  components: { ToolTip },
  methods: {
    fetchExistingGeneDrafts(dataUrl) {
      this.geneExistingDraftsErrorMsg = this.geneExistingDrafts = null;
      this.isGeneExistingDraftsDataLoading = true;
      let url = "";
      if (dataUrl) {
        url = dataUrl.replace(/^.*\/\/[^\/]+/, ""); // remove domain from url
      } else {
        url = `${SEARCH_URL}?query=${this.gene}&type=draft`;
      }
      api
        .get(url)
        .then((response) => {
          this.geneExistingDrafts = response.data;
        })
        .catch((error) => {
          if (error.response?.status !== 404) {
            this.geneExistingDraftsErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch existing gene drafts. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isGeneExistingDraftsDataLoading = false;
        });
    },
    fetchExistingGeneDraftsNextPage() {
      this.fetchExistingGeneDrafts(this.geneExistingDrafts.next);
    },
    fetchExistingGeneDraftsPreviousPage() {
      this.fetchExistingGeneDrafts(this.geneExistingDrafts.previous);
    },
    fetchExistingGeneRecords(dataUrl) {
      this.geneExistingRecordsErrorMsg = this.geneExistingRecords = null;
      this.isGeneExistingRecordsDataLoading = true;
      let url = "";
      if (dataUrl) {
        url = dataUrl.replace(/^.*\/\/[^\/]+/, ""); // remove domain from url
      } else {
        url = `${SEARCH_URL}?query=${this.gene}&type=gene`;
      }
      api
        .get(url)
        .then((response) => {
          this.geneExistingRecords = response.data;
        })
        .catch((error) => {
          if (error.response?.status !== 404) {
            this.geneExistingRecordsErrorMsg = fetchAndLogGeneralErrorMsg(
              error,
              "Unable to fetch existing gene records. Please try again later."
            );
          }
        })
        .finally(() => {
          this.isGeneExistingRecordsDataLoading = false;
        });
    },
    fetchExistingGeneRecordsNextPage() {
      this.fetchExistingGeneRecords(this.geneExistingRecords.next);
    },
    fetchExistingGeneRecordsPreviousPage() {
      this.fetchExistingGeneRecords(this.geneExistingRecords.previous);
    },
    isUserCreatorOfDraft(email) {
      const authStore = useAuthStore();
      return authStore.userEmail === email;
    },
  },
};
</script>
<template>
  <div>
    <div
      class="d-flex justify-content-center"
      v-if="isGeneExistingDraftsDataLoading || isGeneExistingRecordsDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div
      class="alert alert-danger mt-3"
      role="alert"
      v-else-if="geneExistingDraftsErrorMsg || geneExistingRecordsErrorMsg"
    >
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ geneExistingDraftsErrorMsg || geneExistingRecordsErrorMsg }}
      </div>
    </div>
    <div v-else>
      <button
        type="button"
        class="btn btn-primary mt-3"
        @click="geneSearchBtnClickHandler"
      >
        Create new record
      </button>
      <div v-if="!geneExistingDrafts && !geneExistingRecords">
        <p class="pt-3">
          <i class="bi bi-info-circle"></i> There are no saved drafts or
          published records for this Gene.
        </p>
      </div>
      <div v-if="geneExistingDrafts?.results?.length > 0">
        <h3 class="pt-3">Saved drafts for Gene</h3>
        <div class="mx-1 pt-3 table-responsive-xl">
          <table class="table table-hover table-bordered">
            <thead>
              <tr>
                <th>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" /></th>
                <th>Gene</th>
                <th>Disease</th>
                <th>
                  Allelic Requirement
                  <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
                </th>
                <th>Panels</th>
                <th>
                  Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
                </th>
                <th>Curator</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in geneExistingDrafts.results" :key="item.stable_id">
                <td>
                  {{ item.stable_id }}
                </td>
                <td>
                  {{ item.gene }}
                </td>
                <td>
                  {{ item.disease_name }}
                </td>
                <td>{{ item.genotype }}</td>
                <td>
                  <span v-if="item.panels?.length > 0">
                    {{ item.panels.join(", ") }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="item.confidence"
                    class="badge text-white"
                    :style="{
                      backgroundColor:
                        CONFIDENCE_COLOR_MAP[item.confidence.toLowerCase()],
                    }"
                  >
                    {{ item.confidence }}
                  </span>
                </td>
                <td>
                  Name: {{ item.curator_first + " " + item.curator_last_name }}
                  <br />
                  Email: {{ item.curator_email }}
                </td>
                <td class="text-nowrap">
                  <router-link
                    :to="`/lgd/update-draft/${item.stable_id}`"
                    style="text-decoration: none"
                    v-if="isUserCreatorOfDraft(item.curator_email)"
                  >
                    Update draft
                  </router-link>
                  <a
                    :href="`mailto:${item.curator_email}`"
                    style="text-decoration: none"
                    target="_blank"
                    v-else
                  >
                    Mail curator
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row mx-1 justify-content-between">
          <div class="col-2 px-0">
            <button
              type="button"
              class="btn btn-primary"
              style="float: left"
              @click="fetchExistingGeneDraftsPreviousPage"
              v-if="geneExistingDrafts.previous"
            >
              <i class="bi bi-arrow-left"></i> Previous Page
            </button>
          </div>
          <div class="col-2 px-0">
            <button
              type="button"
              class="btn btn-primary"
              style="float: right"
              @click="fetchExistingGeneDraftsNextPage"
              v-if="geneExistingDrafts.next"
            >
              Next Page
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
      <div v-if="geneExistingRecords?.results?.length > 0">
        <h3 class="pt-3">Published records for Gene</h3>
        <div class="mx-1 pt-3 table-responsive-xl">
          <table class="table table-hover table-bordered">
            <thead>
              <tr>
                <th>G2P ID <ToolTip :toolTipText="HELP_TEXT.G2P_ID" /></th>
                <th>Gene</th>
                <th>Disease</th>
                <th>
                  Allelic Requirement
                  <ToolTip :toolTipText="HELP_TEXT.ALLELIC_REQUIREMENT" />
                </th>
                <th>
                  Mechanism <ToolTip :toolTipText="HELP_TEXT.MECHANISM" />
                </th>
                <th>Panels</th>
                <th>
                  Confidence <ToolTip :toolTipText="HELP_TEXT.CONFIDENCE" />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in geneExistingRecords.results" :key="item.stable_id">
                <td>
                  {{ item.stable_id }}
                </td>
                <td>
                  <router-link
                    v-if="item.gene"
                    :to="`/gene/${item.gene}`"
                    style="text-decoration: none"
                  >
                    {{ item.gene }}
                  </router-link>
                </td>
                <td>
                  <router-link
                    v-if="item.disease"
                    :to="`/disease/${item.disease}`"
                    style="text-decoration: none"
                  >
                    {{ item.disease }}
                  </router-link>
                </td>
                <td>{{ item.genotype }}</td>
                <td>{{ item.mechanism }}</td>
                <td>
                  <span v-if="item.panel?.length > 0">
                    <span v-for="(panelName, index) in item.panel">
                      <span v-if="index < item.panel.length - 1">
                        <router-link
                          :to="`/panel/${panelName}`"
                          style="text-decoration: none"
                        >
                          {{ panelName }} </router-link
                        >,
                      </span>
                      <router-link
                        :to="`/panel/${panelName}`"
                        style="text-decoration: none"
                        v-else
                      >
                        {{ panelName }}
                      </router-link>
                    </span>
                  </span>
                </td>
                <td>
                  <span
                    v-if="item.confidence"
                    class="badge text-white"
                    :style="{
                      backgroundColor:
                        CONFIDENCE_COLOR_MAP[item.confidence.toLowerCase()],
                    }"
                  >
                    {{ item.confidence }}
                  </span>
                </td>
                <td class="text-nowrap">
                  <router-link
                    :to="`/lgd/${item.stable_id}`"
                    style="text-decoration: none"
                    target="_blank"
                    v-if="item.stable_id"
                  >
                    View record <i class="bi bi-box-arrow-up-right"></i>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row mx-1 justify-content-between">
          <div class="col-2 px-0">
            <button
              type="button"
              class="btn btn-primary"
              style="float: left"
              @click="fetchExistingGeneRecordsPreviousPage"
              v-if="geneExistingRecords.previous"
            >
              <i class="bi bi-arrow-left"></i> Previous Page
            </button>
          </div>
          <div class="col-2 px-0">
            <button
              type="button"
              class="btn btn-primary"
              style="float: right"
              @click="fetchExistingGeneRecordsNextPage"
              v-if="geneExistingRecords.next"
            >
              Next Page
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
th {
  white-space: nowrap;
}
</style>
