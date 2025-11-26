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
          <div class="row">
            <div style="width: 10%">
              <p><strong>Symbol</strong></p>
            </div>
            <div style="width: 90%">
              <a
                v-if="geneData.gene_symbol"
                :href="`/gene2phenotype/gene/${geneData.gene_symbol}`"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.gene_symbol }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <p><strong>Synonyms</strong></p>
            </div>
            <div style="width: 90%">
              <p v-if="geneData.synonyms?.length > 0">
                {{ geneData.synonyms.join(", ") }}
              </p>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <p><strong>Function</strong></p>
            </div>
            <div class="pb-3" style="width: 90%">
              <GeneFunction
                v-if="geneFunctionData?.function?.protein_function"
                :geneFunctionText="geneFunctionData.function.protein_function"
                :uniprotAccession="geneFunctionData.function.uniprot_accession"
              />
              <p v-else class="text-muted mb-0">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <p><strong>OMIM</strong></p>
            </div>
            <div style="width: 90%">
              <a
                v-if="geneData.ids?.OMIM"
                :href="OMIM_URL + geneData.ids.OMIM"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.OMIM }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <p><strong>HGNC ID</strong></p>
            </div>
            <div style="width: 90%">
              <a
                v-if="geneData.ids?.HGNC"
                :href="HGNC_URL + geneData.ids.HGNC"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.HGNC }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <p><strong>Ensembl ID</strong></p>
            </div>
            <div style="width: 90%">
              <a
                v-if="geneData.ids?.Ensembl"
                :href="ENSEMBL_GENE_URL + geneData.ids.Ensembl"
                style="text-decoration: none"
                target="_blank"
              >
                {{ geneData.ids.Ensembl }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
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
