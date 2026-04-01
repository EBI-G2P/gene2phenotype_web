<script>
import { EUROPE_PMC_URL, HPO_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    phenotypes: Array,
  },
  data() {
    return {
      EUROPE_PMC_URL,
      HPO_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="phenotypes?.length > 0"
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
          Phenotypic Features ({{ phenotypes.length }})
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
              <tr v-for="item in phenotypes" :key="item.accession">
                <td style="width: 10%">
                  <a
                    :href="HPO_URL + item.accession"
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
                  <span v-if="item.publications?.length > 0">
                    <span v-for="(publicationItem, index) in item.publications">
                      <span v-if="index < item.publications.length - 1">
                        <a
                          :href="EUROPE_PMC_URL + publicationItem"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          {{ publicationItem }}
                        </a>
                        ,
                      </span>
                      <a
                        v-else
                        :href="EUROPE_PMC_URL + publicationItem"
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
</template>
