<script>
import {
  checkLogInAndAppendAuthHeaders,
  appendAuthenticationHeaders,
  isUserLoggedIn,
  logOutUser,
} from "../utility/AuthenticationUtility.js";
import AddPanelModal from "./update/AddPanelModal.vue";

export default {
  data() {
    return {
      isDataLoading: false,
      locusGeneDiseaseData: null,
      errorMsg: null,
      confidenceColorMap: {
        definitive: "#276749",
        strong: "#38a169",
        moderate: "#68d391",
        limited: "#fc8181",
        disputed: "#e53e3e",
        refuted: "#9b2c2c",
      },
      isRecordPartOfUserPanels: false,
      stableId: null,
      userPanels: null,
      isPanelDataLoading: false,
    };
  },
  components: {
    AddPanelModal,
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchRecordData();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },
  methods: {
    fetchRecordData() {
      this.stableId = this.$route.params.stableId;
      this.errorMsg = this.locusGeneDiseaseData = null;
      this.isDataLoading = true;
      const apiHeaders = checkLogInAndAppendAuthHeaders({
        "Content-Type": "application/json",
      });
      fetch(`/gene2phenotype/api/lgd/${this.stableId}/`, {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(
              new Error("Unable to fetch locus gene disease data")
            );
          }
        })
        .then((responseJson) => {
          this.isDataLoading = false;
          this.locusGeneDiseaseData = responseJson;
          this.fetchUserPanels();
        })
        .catch((error) => {
          this.isDataLoading = false;
          this.errorMsg = error.message;
          console.log(error);
        });
    },
    fetchUserPanels() {
      if (!isUserLoggedIn()) {
        logOutUser();
        return;
      }

      this.userPanels = null;
      this.isPanelDataLoading = true;
      const apiHeaders = appendAuthenticationHeaders({
        "Content-Type": "application/json",
      });
      fetch("/gene2phenotype/api/user/panels/", {
        method: "GET",
        headers: apiHeaders,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            return Promise.reject(new Error("Unable to fetch user panels."));
          }
        })
        .then((responseJson) => {
          this.isPanelDataLoading = false;
          if (responseJson && responseJson.length > 0) {
            this.userPanels = responseJson;
            this.validateIsRecordPartOfUserPanels(
              this.locusGeneDiseaseData?.panels,
              this.userPanels
            );
          }
        })
        .catch((error) => {
          this.isPanelDataLoading = false;
          console.log(error);
        });
    },
    validateIsRecordPartOfUserPanels(recordPanels, userPanels) {
      // convert array of objects (name, description) to array of strings (description)
      const userPanelDescriptions = userPanels.map(
        (panelObj) => panelObj.description
      );
      // if any of the user panels exists in the g2p record panels list then true else false
      this.isRecordPartOfUserPanels = recordPanels.some((item) =>
        userPanelDescriptions.includes(item.description)
      );
    },
    goToUpdateRecordPage() {
      this.$router.push(`/lgd/update/${this.stableId}`);
    },
    refreshPage() {
      this.$router.go(); // refresh current page
    },
    isLoggedIn() {
      return isUserLoggedIn();
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <div
      class="d-flex justify-content-center"
      v-if="isDataLoading"
      style="margin-top: 250px; margin-bottom: 250px"
    >
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="alert alert-danger mt-3" role="alert" v-if="errorMsg">
      <div>
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>
    </div>
    <div v-if="locusGeneDiseaseData">
      <div class="d-flex justify-content-between">
        <div>
          <h2 v-if="locusGeneDiseaseData.disease?.name">
            {{ locusGeneDiseaseData.disease.name }}
          </h2>
          <h2 v-else class="text-muted">Disease Name Not Available</h2>
        </div>
        <button
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#add-panel-modal"
          v-if="
            !isPanelDataLoading &&
            userPanels &&
            userPanels.length > 0 &&
            isLoggedIn() &&
            !isRecordPartOfUserPanels
          "
        >
          <i class="bi bi-plus-circle-fill"></i> Add to another panel
        </button>
        <button
          class="btn btn-outline-primary"
          @click="goToUpdateRecordPage"
          v-if="!isPanelDataLoading && isLoggedIn() && isRecordPartOfUserPanels"
        >
          <i class="bi bi-pencil-square"></i> Update record
        </button>
        <div v-if="isPanelDataLoading && isLoggedIn()" class="my-auto">
          <span
            class="spinner-border spinner-border-sm text-primary"
            role="status"
            aria-hidden="true"
          ></span>
        </div>
      </div>
      <table class="table table-borderless my-3">
        <tbody>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Allelic Requirement</h4>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.genotype">
                {{ locusGeneDiseaseData.genotype }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Cross Cutting Modifier</h4>
            </td>
            <td class="w-75">
              <p
                v-if="
                  locusGeneDiseaseData.cross_cutting_modifier &&
                  locusGeneDiseaseData.cross_cutting_modifier.length > 0
                "
              >
                {{
                  locusGeneDiseaseData.cross_cutting_modifier
                    .map((item) => item.term)
                    .join(", ")
                }}
              </p>
              <p v-else class="text-muted">Not Assigned</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Variant Information</h4>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Type(s)</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.variant_type &&
                  locusGeneDiseaseData.variant_type.length > 0
                "
              >
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Inheritance</th>
                    <th>Publications</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.variant_type">
                    <td>
                      <a
                        v-if="item.accession"
                        v-bind:href="`http://www.sequenceontology.org/browser/current_release/term/${item.accession}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ item.term }}
                      </a>
                      <span v-else>{{ item.term }}</span>
                    </td>
                    <td class="ps-0">
                      <ul
                        v-if="
                          item.de_novo ||
                          item.inherited ||
                          item.unknown_inheritance
                        "
                        class="mb-0"
                      >
                        <li v-if="item.de_novo">De Novo</li>
                        <li v-if="item.inherited">Inherited</li>
                        <li v-if="item.unknown_inheritance">
                          Unknown Inheritance
                        </li>
                      </ul>
                    </td>
                    <td>
                      <span
                        v-if="item.publications && item.publications.length > 0"
                      >
                        <span
                          v-for="(publicationItem, index) in item.publications"
                        >
                          <span v-if="index < item.publications.length - 1">
                            <a
                              v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                              style="text-decoration: none"
                              target="_blank"
                            >
                              {{ publicationItem }}
                            </a>
                            ,
                          </span>
                          <a
                            v-else
                            v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                            style="text-decoration: none"
                            target="_blank"
                          >
                            {{ publicationItem }}
                          </a>
                        </span>
                      </span>
                    </td>
                    <td>{{ item.comment }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Description</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.variant_description &&
                  locusGeneDiseaseData.variant_description.length > 0
                "
              >
                <thead>
                  <tr>
                    <th>Variant Description</th>
                    <th>Publications</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.variant_description">
                    <td>
                      {{ item.description }}
                    </td>
                    <td>
                      <span
                        v-if="item.publications && item.publications.length > 0"
                      >
                        <span
                          v-for="(publicationItem, index) in item.publications"
                        >
                          <span v-if="index < item.publications.length - 1">
                            <a
                              v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                              style="text-decoration: none"
                              target="_blank"
                            >
                              {{ publicationItem }}
                            </a>
                            ,
                          </span>
                          <a
                            v-else
                            v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                            style="text-decoration: none"
                            target="_blank"
                          >
                            {{ publicationItem }}
                          </a>
                        </span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Variant Consequence(s)</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.variant_consequence &&
                  locusGeneDiseaseData.variant_consequence.length > 0
                "
              >
                <thead>
                  <tr>
                    <th>Variant Consequence</th>
                    <th>Support</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in locusGeneDiseaseData.variant_consequence">
                    <td>
                      {{ item.variant_consequence }}
                    </td>
                    <td>
                      {{ item.support }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Molecular Mechanism</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Mechanism</h6>
            </td>
            <td class="w-75">
              <p
                v-if="
                  locusGeneDiseaseData.molecular_mechanism &&
                  locusGeneDiseaseData.molecular_mechanism.length > 0
                "
              >
                {{ locusGeneDiseaseData.molecular_mechanism[0].mechanism }}
                <span
                  v-if="
                    locusGeneDiseaseData.molecular_mechanism[0].support ===
                    'inferred'
                  "
                >
                  ({{ locusGeneDiseaseData.molecular_mechanism[0].support }})
                </span>
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Categorization</h6>
            </td>
            <td class="w-75">
              <p
                v-if="
                  locusGeneDiseaseData.molecular_mechanism &&
                  locusGeneDiseaseData.molecular_mechanism.length > 0
                "
              >
                {{ locusGeneDiseaseData.molecular_mechanism[0].synopsis }}
                <span
                  v-if="
                    locusGeneDiseaseData.molecular_mechanism[0]
                      .synopsis_support === 'inferred'
                  "
                >
                  ({{
                    locusGeneDiseaseData.molecular_mechanism[0]
                      .synopsis_support
                  }})
                </span>
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr
            v-if="
              locusGeneDiseaseData.molecular_mechanism &&
              locusGeneDiseaseData.molecular_mechanism.length > 0 &&
              locusGeneDiseaseData.molecular_mechanism[0].evidence &&
              Object.keys(locusGeneDiseaseData.molecular_mechanism[0].evidence)
                .length > 0
            "
          >
            <td class="w-25 text-end">
              <h6>Evidence</h6>
            </td>
            <td class="w-75">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Evidence Types</th>
                    <th>Publication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(value, key) in locusGeneDiseaseData
                      .molecular_mechanism[0].evidence"
                  >
                    <td class="ps-0">
                      <ul
                        v-if="value && Object.keys(value).length > 0"
                        class="mb-0"
                      >
                        <li
                          v-for="(
                            secondaryEvidenceTypeArray, primaryEvidenceType
                          ) in value"
                        >
                          {{ primaryEvidenceType }} :
                          {{
                            secondaryEvidenceTypeArray &&
                            secondaryEvidenceTypeArray.length > 0
                              ? secondaryEvidenceTypeArray.join(", ")
                              : null
                          }}
                        </li>
                      </ul>
                    </td>
                    <td>
                      <a
                        v-bind:href="`https://europepmc.org/article/MED/${key}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ key }}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Phenotypic Feature(s)</h4>
            </td>
            <td class="w-75">
              <div
                v-if="
                  locusGeneDiseaseData.phenotypes &&
                  locusGeneDiseaseData.phenotypes.length > 0
                "
                class="accordion accordion-flush"
                id="accordionPhenotypicFeatures"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsiblePhenotypicFeaturesTable"
                      aria-expanded="false"
                      aria-controls="collapsiblePhenotypicFeaturesTable"
                    >
                      Phenotypic Feature(s)
                    </button>
                  </h2>
                  <div
                    id="collapsiblePhenotypicFeaturesTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionPhenotypicFeatures"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th style="width: 10%">Accession</th>
                            <th style="width: 60%">Term</th>
                            <th style="width: 30%">Publications</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="item in locusGeneDiseaseData.phenotypes"
                            :key="item.accession"
                          >
                            <td style="width: 10%">
                              <a
                                :href="`https://hpo.jax.org/app/browse/term/${item.accession}`"
                                style="text-decoration: none"
                                v-if="item.accession"
                                target="_blank"
                              >
                                {{ item.accession }}
                              </a>
                            </td>
                            <td style="width: 60%">
                              {{ item.term }}
                            </td>
                            <td style="width: 30%">
                              <span
                                v-if="
                                  item.publications &&
                                  item.publications.length > 0
                                "
                              >
                                <span
                                  v-for="(
                                    publicationItem, index
                                  ) in item.publications"
                                >
                                  <span
                                    v-if="index < item.publications.length - 1"
                                  >
                                    <a
                                      v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                                      style="text-decoration: none"
                                      target="_blank"
                                    >
                                      {{ publicationItem }}
                                    </a>
                                    ,
                                  </span>
                                  <a
                                    v-else
                                    v-bind:href="`https://europepmc.org/article/MED/${publicationItem}`"
                                    style="text-decoration: none"
                                    target="_blank"
                                  >
                                    {{ publicationItem }}
                                  </a>
                                </span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Confidence</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Level</h6>
            </td>
            <td>
              <span
                v-if="locusGeneDiseaseData.confidence"
                class="badge text-white fs-6"
                :style="{
                  backgroundColor:
                    confidenceColorMap[
                      locusGeneDiseaseData.confidence.toLowerCase()
                    ],
                }"
              >
                {{ locusGeneDiseaseData.confidence }}
              </span>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Justification</h6>
            </td>
            <td>
              <p v-if="locusGeneDiseaseData.confidence_support">
                {{ locusGeneDiseaseData.confidence_support }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Evidence</h4>
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Publication(s)</h6>
            </td>
            <td class="w-75">
              <div
                v-if="
                  locusGeneDiseaseData.publications &&
                  locusGeneDiseaseData.publications.length > 0
                "
                class="accordion accordion-flush"
                id="accordionPublications"
              >
                <div class="accordion-item">
                  <h2 class="accordion-header border">
                    <button
                      class="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapsiblePublicationsTable"
                      aria-expanded="false"
                      aria-controls="collapsiblePublicationsTable"
                    >
                      Publication(s)
                    </button>
                  </h2>
                  <div
                    id="collapsiblePublicationsTable"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionPublications"
                  >
                    <div class="accordion-body p-0">
                      <table class="table table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>PMID</th>
                            <th>Title</th>
                            <th>Individuals</th>
                            <th>Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in locusGeneDiseaseData.publications">
                            <td>
                              <a
                                v-if="item.publication?.pmid"
                                v-bind:href="`https://europepmc.org/article/MED/${item.publication?.pmid}`"
                                style="text-decoration: none"
                                target="_blank"
                              >
                                {{ item.publication.pmid }}
                              </a>
                            </td>
                            <td>
                              {{ item.publication?.title }}
                            </td>
                            <td>
                              <span
                                v-if="
                                  item.publication?.families &&
                                  item.publication?.families.length > 0
                                "
                              >
                                Number of Families:
                                {{
                                  item.publication.families[0]
                                    .number_of_families
                                }}
                                <br />
                                Affected Individuals:
                                {{
                                  item.publication.families[0]
                                    .affected_individuals
                                }}
                                <br />
                                Ancestry:
                                {{ item.publication.families[0].ancestry }}
                                <br />
                                Consanguinity:
                                {{ item.publication.families[0].consanguinity }}
                              </span>
                            </td>
                            <td>
                              <span
                                v-if="
                                  item.publication?.comments &&
                                  item.publication?.comments.length > 0
                                "
                              >
                                {{
                                  item.publication.comments[
                                    item.publication.comments.length - 1
                                  ].comment
                                }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Panel(s)</h4>
            </td>
            <td class="w-75">
              <span
                v-if="
                  locusGeneDiseaseData.panels &&
                  locusGeneDiseaseData.panels.length > 0
                "
              >
                <span v-for="(item, index) in locusGeneDiseaseData.panels">
                  <span v-if="index < locusGeneDiseaseData.panels.length - 1">
                    <router-link
                      :to="`/panel/${item.name}`"
                      style="text-decoration: none"
                    >
                      {{ item.description ? item.description : item.name }}
                    </router-link>
                    ,
                  </span>
                  <router-link
                    :to="`/panel/${item.name}`"
                    v-else
                    style="text-decoration: none"
                  >
                    {{ item.description ? item.description : item.name }}
                  </router-link>
                </span>
              </span>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h4>Gene Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Gene Symbol</h6>
            </td>
            <td>
              <router-link
                :to="`/gene/${locusGeneDiseaseData.locus?.gene_symbol}`"
                v-if="locusGeneDiseaseData.locus?.gene_symbol"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.locus.gene_symbol }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Synonym(s)</h6>
            </td>
            <td>
              <p
                v-if="
                  locusGeneDiseaseData.locus?.synonyms &&
                  locusGeneDiseaseData.locus?.synonyms.length > 0
                "
              >
                {{ locusGeneDiseaseData.locus.synonyms.join(", ") }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Location</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.ensembl.org/Homo_sapiens/Location/View?r=${locusGeneDiseaseData.locus?.sequence}:${locusGeneDiseaseData.locus?.start}-${locusGeneDiseaseData.locus?.end}`"
                v-if="
                  locusGeneDiseaseData.locus?.sequence &&
                  locusGeneDiseaseData.locus?.start &&
                  locusGeneDiseaseData.locus?.end
                "
                style="text-decoration: none"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.sequence }}:{{
                  locusGeneDiseaseData.locus.start
                }}-{{ locusGeneDiseaseData.locus.end }}:{{
                  locusGeneDiseaseData.locus.strand
                }}
              </a>
              <p
                v-else-if="
                  locusGeneDiseaseData.locus?.sequence ||
                  locusGeneDiseaseData.locus?.start ||
                  locusGeneDiseaseData.locus?.end
                "
              >
                {{ locusGeneDiseaseData.locus.sequence }}:{{
                  locusGeneDiseaseData.locus.start
                }}-{{ locusGeneDiseaseData.locus.end }}:{{
                  locusGeneDiseaseData.locus.strand
                }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>OMIM</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.omim.org/entry/${locusGeneDiseaseData.locus?.ids?.OMIM}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus?.ids?.OMIM"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.OMIM }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Ensembl ID</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.ensembl.org/Homo_sapiens/Gene?g=${locusGeneDiseaseData.locus?.ids?.Ensembl}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus?.ids?.Ensembl"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.Ensembl }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>HGNC ID</h6>
            </td>
            <td>
              <a
                v-bind:href="`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${locusGeneDiseaseData.locus?.ids?.HGNC}`"
                style="text-decoration: none"
                v-if="locusGeneDiseaseData.locus?.ids?.HGNC"
                target="_blank"
              >
                {{ locusGeneDiseaseData.locus.ids.HGNC }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Disease Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Disease Name</h6>
            </td>
            <td>
              <router-link
                :to="`/disease/${locusGeneDiseaseData.disease?.name}`"
                v-if="locusGeneDiseaseData.disease?.name"
                style="text-decoration: none"
              >
                {{ locusGeneDiseaseData.disease?.name }}
              </router-link>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h6>Cross Reference(s)</h6>
            </td>
            <td class="w-75">
              <table
                class="table table-bordered"
                v-if="
                  locusGeneDiseaseData.disease?.ontology_terms &&
                  locusGeneDiseaseData.disease?.ontology_terms.length > 0
                "
              >
                <thead>
                  <tr>
                    <th>Accession</th>
                    <th>Term</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="ontologyTerm in locusGeneDiseaseData.disease
                      ?.ontology_terms"
                  >
                    <td>
                      <a
                        v-if="ontologyTerm.source === 'OMIM'"
                        v-bind:href="`https://www.omim.org/entry/${ontologyTerm.accession}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ ontologyTerm.accession }}
                      </a>
                      <a
                        v-else-if="ontologyTerm.source === 'Mondo'"
                        v-bind:href="`https://monarchinitiative.org/${ontologyTerm.accession}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ ontologyTerm.accession }}
                      </a>
                      <span v-else>{{ ontologyTerm.accession }}</span>
                    </td>
                    <td>{{ ontologyTerm.term }}</td>
                    <td>{{ ontologyTerm.source }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr>
            <td class="w-25 text-end">
              <h4>Curation Information</h4>
            </td>
            <td></td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Curator(s)</h6>
            </td>
            <td class="w-75">
              <p class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Created On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.date_created">
                {{ locusGeneDiseaseData.date_created }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
          <tr class="align-middle">
            <td class="w-25 text-end">
              <h6>Last Updated On</h6>
            </td>
            <td class="w-75">
              <p v-if="locusGeneDiseaseData.last_updated">
                {{ locusGeneDiseaseData.last_updated }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </td>
          </tr>
        </tbody>
      </table>
      <AddPanelModal
        :stableId="stableId"
        :userPanels="userPanels"
        @refreshpage="refreshPage"
      />
    </div>
  </div>
</template>
<style scoped>
h6 {
  font-weight: bold;
}

h4,
h6,
p {
  margin-bottom: 0;
}
</style>
