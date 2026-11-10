<script>
import { MONDO_URL, OMIM_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    ontologyTerms: Array,
  },
  data() {
    return {
      OMIM_URL,
      MONDO_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="ontologyTerms?.length > 0"
    class="accordion accordion-flush"
    id="accordionCrossReferences"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleCrossReferencesTable"
          aria-expanded="false"
          aria-controls="collapsibleCrossReferencesTable"
        >
          Cross References ({{ ontologyTerms.length }})
        </button>
      </h2>
      <div
        id="collapsibleCrossReferencesTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionCrossReferences"
      >
        <div class="accordion-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered mb-0">
              <thead>
                <tr>
                  <th>Accession</th>
                  <th>Term</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ontologyTerm in ontologyTerms"
                  :key="`${ontologyTerm.source}-${ontologyTerm.accession}`"
                >
                  <td>
                    <a
                      v-if="ontologyTerm.source === 'OMIM'"
                      class="text-decoration-none"
                      :href="OMIM_URL + ontologyTerm.accession"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ ontologyTerm.accession }}
                    </a>
                    <a
                      v-else-if="ontologyTerm.source === 'Mondo'"
                      class="text-decoration-none"
                      :href="MONDO_URL + ontologyTerm.accession"
                      target="_blank"
                      rel="noopener noreferrer"
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
          </div>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="text-muted">Not Available</p>
</template>
