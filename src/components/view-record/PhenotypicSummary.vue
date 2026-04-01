<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    phenotypeSummary: Array,
  },
  data() {
    return {
      EUROPE_PMC_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="phenotypeSummary?.length > 0"
    class="accordion accordion-flush"
    id="accordionPhenotypicSummary"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsiblePhenotypicSummaryTable"
          aria-expanded="false"
          aria-controls="collapsiblePhenotypicSummaryTable"
        >
          Phenotypic Summary ({{ phenotypeSummary.length }})
        </button>
      </h2>
      <div
        id="collapsiblePhenotypicSummaryTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionPhenotypicSummary"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Publication</th>
                <th>Phenotypic Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in phenotypeSummary">
                <td>
                  <a
                    v-if="item.publication"
                    :href="EUROPE_PMC_URL + item.publication"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    {{ item.publication }}
                  </a>
                </td>
                <td style="white-space: pre-wrap">
                  {{ item.summary }}
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
