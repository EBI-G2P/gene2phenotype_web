<script>
import api from "../../services/api.js";
import { CONFIDENCE_COLOR_MAP, HELP_TEXT } from "../../utility/Constants.js";
import { CLAIM_DRAFT_URL, SEARCH_URL } from "../../utility/UrlConstants.js";
import ToolTip from "../tooltip/ToolTip.vue";
import { useAuthStore } from "../../store/auth.js";
import { fetchAndLogApiResponseErrorMsg } from "../../utility/ErrorUtility.js";

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
          this.resetClaimDraftState();
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
      claimDraftErrorMsg: null,
      claimDraftSuccessMsg: null,
      isClaimDraftLoading: false,
      claimDraftStableId: null,
      CONFIDENCE_COLOR_MAP,
      HELP_TEXT,
    };
  },
  components: { ToolTip },
  methods: {
    resetClaimDraftState() {
      this.claimDraftErrorMsg = this.claimDraftSuccessMsg = null;
      this.isClaimDraftLoading = false;
      this.claimDraftStableId = null;
    },
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
            this.geneExistingDraftsErrorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch existing gene drafts. Please try again later.",
              "Unable to fetch existing gene drafts.",
            );
          }
        })
        .finally(() => {
          this.isGeneExistingDraftsDataLoading = false;
        });
    },
    async claimDraft(stableId) {
      if (!stableId) {
        return;
      }

      this.claimDraftErrorMsg = this.claimDraftSuccessMsg = null;
      this.isClaimDraftLoading = true;
      this.claimDraftStableId = stableId;

      let claimDraftResponse = null;
      // Claim the draft first; Only continue to refresh existing gene drafts after a successful claim
      try {
        claimDraftResponse = await api.patch(
          CLAIM_DRAFT_URL.replace(":stableid", stableId),
        );
      } catch (error) {
        this.claimDraftErrorMsg = fetchAndLogApiResponseErrorMsg(
          error,
          error?.response?.data?.error,
          "Unable to claim draft. Please try again later.",
          "Unable to claim draft.",
        );
        this.isClaimDraftLoading = false;
        this.claimDraftStableId = null;
        return;
      }

      // Refresh existing gene drafts so the UI reflects server state
      try {
        await this.refreshExistingGeneDrafts();
        this.claimDraftSuccessMsg =
          claimDraftResponse?.data?.message || "Draft claimed successfully.";
      } catch (error) {
        this.claimDraftErrorMsg = fetchAndLogApiResponseErrorMsg(
          error,
          error?.response?.data?.error,
          "Draft claimed, but unable to refresh drafts. Please reload the page.",
          "Draft claimed, but unable to refresh drafts.",
        );
      } finally {
        this.isClaimDraftLoading = false;
        this.claimDraftStableId = null;
      }
    },
    async refreshExistingGeneDrafts() {
      // Refetch existing gene drafts
      // Loading and error states are handled by the 'claimDraft' method

      const url = `${SEARCH_URL}?query=${this.gene}&type=draft`;

      try {
        const response = await api.get(url);
        this.geneExistingDrafts = response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          this.geneExistingDrafts = null;
          return;
        }

        throw error;
      }
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
            this.geneExistingRecordsErrorMsg = fetchAndLogApiResponseErrorMsg(
              error,
              error?.response?.data?.error,
              "Unable to fetch existing gene records. Please try again later.",
              "Unable to fetch existing gene records.",
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
    getCuratorName(item) {
      return [item.curator_first, item.curator_last_name]
        .filter(Boolean)
        .join(" ");
    },
  },
};
</script>
<template>
  <div>
    <div
      v-if="isGeneExistingDraftsDataLoading || isGeneExistingRecordsDataLoading"
      class="d-flex justify-content-center"
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
      <div
        v-if="claimDraftErrorMsg"
        class="alert alert-danger mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-exclamation-circle-fill"></i>
          {{ claimDraftErrorMsg }}
        </div>
      </div>
      <div
        v-if="claimDraftSuccessMsg"
        class="alert alert-success mt-3"
        role="alert"
      >
        <div>
          <i class="bi bi-check-circle-fill"></i>
          {{ claimDraftSuccessMsg }}
        </div>
      </div>
      <div v-if="!geneExistingDrafts && !geneExistingRecords">
        <div class="alert alert-primary mt-3" role="alert">
          <i class="bi bi-info-circle"></i> There are no saved drafts or
          published records for this Gene.
        </div>
        <button
          type="button"
          class="btn btn-primary mt-3"
          @click="geneSearchBtnClickHandler"
        >
          Create new record
        </button>
      </div>
      <div v-else>
        <div v-if="geneExistingRecords?.results?.length > 0">
          <h3 class="pt-3">Existing records available to add to your panel</h3>
          <p class="text-muted mb-0">
            View existing records and select 'Update record' to add to your
            panel
          </p>
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
                <tr
                  v-for="item in geneExistingRecords.results"
                  :key="item.stable_id"
                >
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
                          v-else
                          :to="`/panel/${panelName}`"
                          style="text-decoration: none"
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
                      v-if="item.stable_id"
                      :to="`/lgd/${item.stable_id}`"
                      style="text-decoration: none"
                      target="_blank"
                    >
                      View <i class="bi bi-box-arrow-up-right"></i>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row mx-1 justify-content-between">
            <div class="col-2 px-0">
              <button
                v-if="geneExistingRecords.previous"
                @click="fetchExistingGeneRecordsPreviousPage"
                type="button"
                class="btn btn-primary"
                style="float: left"
              >
                <i class="bi bi-arrow-left"></i> Previous Page
              </button>
            </div>
            <div class="col-2 px-0">
              <button
                v-if="geneExistingRecords.next"
                @click="fetchExistingGeneRecordsNextPage"
                type="button"
                class="btn btn-primary"
                style="float: right"
              >
                Next Page
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
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
                <tr
                  v-for="item in geneExistingDrafts.results"
                  :key="item.stable_id"
                >
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
                    <template v-if="item.status !== 'automatic'">
                      <span v-if="getCuratorName(item)">
                        {{ getCuratorName(item) }}
                      </span>
                    </template>
                  </td>
                  <td class="text-nowrap">
                    <router-link
                      v-if="isUserCreatorOfDraft(item.curator_email)"
                      :to="`/lgd/update-draft/${item.stable_id}`"
                      style="text-decoration: none"
                    >
                      Update <i class="bi bi-pencil-square"></i>
                    </router-link>
                    <template v-else-if="item.status === 'automatic'">
                      <button
                        type="button"
                        class="btn btn-link p-0 mb-1 claim-draft-button"
                        style="text-decoration: none"
                        :disabled="isClaimDraftLoading"
                        @click="claimDraft(item.stable_id)"
                      >
                        <span
                          v-if="claimDraftStableId === item.stable_id"
                          class="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span v-else
                          >Claim <i class="bi bi-plus-circle"></i
                        ></span>
                      </button>
                      <br />
                      <router-link
                        v-if="item.stable_id"
                        :to="`/lgd/review-draft/${item.stable_id}`"
                        style="text-decoration: none"
                      >
                        Review <i class="bi bi-file-earmark-text"></i>
                      </router-link>
                    </template>
                    <a
                      v-else
                      :href="`mailto:${item.curator_email}`"
                      style="text-decoration: none"
                      target="_blank"
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
                v-if="geneExistingDrafts.previous"
                @click="fetchExistingGeneDraftsPreviousPage"
                type="button"
                class="btn btn-primary"
                style="float: left"
              >
                <i class="bi bi-arrow-left"></i> Previous Page
              </button>
            </div>
            <div class="col-2 px-0">
              <button
                v-if="geneExistingDrafts.next"
                @click="fetchExistingGeneDraftsNextPage"
                type="button"
                class="btn btn-primary"
                style="float: right"
              >
                Next Page
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="my-3">
          <h6 class="mb-3">
            Adding a novel disease or an association with a different mechanism
            or allelic requirement?
          </h6>
          <div>
            <button
              type="button"
              class="btn btn-link m-0 p-0"
              style="text-decoration: none"
              data-bs-toggle="modal"
              data-bs-target="#record-guidelines-modal"
            >
              Please read this information before creating a new record
              <i class="bi bi-file-earmark-text"></i>
            </button>
          </div>
          <button
            type="button"
            class="btn btn-primary mt-3"
            @click="geneSearchBtnClickHandler"
          >
            Create new record
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.claim-draft-button {
  min-width: 48px;
}

th {
  white-space: nowrap;
}
</style>
