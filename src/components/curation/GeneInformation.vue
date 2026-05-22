<script>
import {
  DECIPHER_URL,
  ENSEMBL_GENE_URL,
  HGNC_URL,
  OMIM_URL,
} from "../../utility/UrlConstants.js";
import GeneFunction from "../text/GeneFunction.vue";
export default {
  props: {
    geneData: Object,
    geneFunctionData: Object,
  },
  data() {
    return {
      DECIPHER_URL,
      ENSEMBL_GENE_URL,
      HGNC_URL,
      OMIM_URL,
    };
  },
  components: { GeneFunction },
};
</script>
<template>
  <div v-if="geneData" class="accordion py-1" id="gene-info-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#gene-info-section-body"
          aria-expanded="true"
          aria-controls="gene-info-section-body"
        >
          Gene Information
        </button>
      </h2>
      <div id="gene-info-section-body" class="accordion-collapse collapse show">
        <div class="accordion-body">
          <dl class="row mb-0">
            <dt class="gene-info-label">Symbol</dt>
            <dd class="gene-info-value">
              <a
                v-if="geneData.gene_symbol"
                :href="`/gene2phenotype/gene/${geneData.gene_symbol}`"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.gene_symbol }}
              </a>
              <span v-else class="text-muted">Not Available</span>
            </dd>
            <dt class="gene-info-label">Synonyms</dt>
            <dd class="gene-info-value">
              <span v-if="geneData.synonyms?.length > 0">
                {{ geneData.synonyms.join(", ") }}
              </span>
              <span v-else class="text-muted">Not Available</span>
            </dd>
            <dt class="gene-info-label">Function</dt>
            <dd class="gene-info-value">
              <GeneFunction
                v-if="geneFunctionData?.function?.protein_function"
                :geneFunctionText="geneFunctionData.function.protein_function"
                :uniprotAccession="geneFunctionData.function.uniprot_accession"
              />
              <span v-else class="text-muted">Not Available</span>
            </dd>
            <dt class="gene-info-label">OMIM</dt>
            <dd class="gene-info-value">
              <a
                v-if="geneData.ids?.OMIM"
                :href="OMIM_URL + geneData.ids.OMIM"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.OMIM }}
              </a>
              <span v-else class="text-muted">Not Available</span>
            </dd>
            <dt class="gene-info-label">HGNC ID</dt>
            <dd class="gene-info-value">
              <a
                v-if="geneData.ids?.HGNC"
                :href="HGNC_URL + geneData.ids.HGNC"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.HGNC }}
              </a>
              <span v-else class="text-muted">Not Available</span>
            </dd>
            <dt class="gene-info-label">Ensembl ID</dt>
            <dd class="gene-info-value">
              <a
                v-if="geneData.ids?.Ensembl"
                :href="ENSEMBL_GENE_URL + geneData.ids.Ensembl"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.Ensembl }}
              </a>
              <span v-else class="text-muted">Not Available</span>
            </dd>
          </dl>
          <div class="row">
            <a
              :href="DECIPHER_URL + geneData.gene_symbol"
              style="text-decoration: none"
              target="_blank"
            >
              View in DECIPHER
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.gene-info-label,
.gene-info-value {
  flex: 0 0 auto;
  width: 100%;
}

.gene-info-label {
  margin-bottom: 0.25rem;
}

.gene-info-value {
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .gene-info-label {
    width: 20%;
  }

  .gene-info-value {
    width: 80%;
  }
}

@media (min-width: 1200px) {
  .gene-info-label {
    width: 10%;
  }

  .gene-info-value {
    width: 90%;
  }
}
</style>
