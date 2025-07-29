<script>
import {
  DECIPHER_URL,
  ENSEMBL_GENE_URL,
  HGNC_URL,
  OMIM_URL,
  UNIPROT_URL,
} from "../../utility/UrlConstants.js";
import { MAX_CHARACTERS } from "../../utility/Constants.js";
export default {
  data() {
    return {
      isReadMoreActivated: false,
      MAX_CHARACTERS,
      DECIPHER_URL,
      ENSEMBL_GENE_URL,
      HGNC_URL,
      OMIM_URL,
      UNIPROT_URL,
    };
  },
  props: {
    geneData: Object,
    geneFunctionData: Object,
  },
  methods: {
    toggleReadMore() {
      this.isReadMoreActivated = !this.isReadMoreActivated;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="gene-info-section" v-if="geneData">
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
              <strong><p>Symbol</p></strong>
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
              <strong><p>Synonyms</p></strong>
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
              <strong><p>Function</p></strong>
            </div>
            <div style="width: 90%">
              <p v-if="geneFunctionData?.function?.protein_function">
                <span
                  v-if="
                    isReadMoreActivated ||
                    geneFunctionData.function.protein_function.length <=
                      MAX_CHARACTERS
                  "
                >
                  {{ geneFunctionData.function.protein_function }}
                </span>
                <span v-else>
                  {{
                    geneFunctionData.function.protein_function.slice(
                      0,
                      MAX_CHARACTERS
                    )
                  }}&hellip;
                </span>
                <button
                  class="btn btn-link p-0 ml-2 align-baseline"
                  @click="toggleReadMore"
                  v-if="
                    geneFunctionData.function.protein_function.length >
                    MAX_CHARACTERS
                  "
                >
                  {{ isReadMoreActivated ? "Show less" : "Show more" }}
                </button>
                <br />
                <b>Source:</b>
                <a
                  :href="
                    UNIPROT_URL + geneFunctionData.function.uniprot_accession
                  "
                  style="text-decoration: none"
                  target="_blank"
                >
                  UniProt
                </a>
              </p>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <strong><p>OMIM</p></strong>
            </div>
            <div style="width: 90%">
              <a
                :href="OMIM_URL + geneData.ids.OMIM"
                style="text-decoration: none"
                v-if="geneData.ids?.OMIM"
                target="_blank"
              >
                {{ geneData.ids.OMIM }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <strong><p>HGNC ID</p></strong>
            </div>
            <div style="width: 90%">
              <a
                :href="HGNC_URL + geneData.ids.HGNC"
                style="text-decoration: none"
                v-if="geneData.ids?.HGNC"
                target="_blank"
              >
                {{ geneData.ids.HGNC }}
              </a>
              <p v-else class="text-muted">Not Available</p>
            </div>
          </div>
          <div class="row">
            <div style="width: 10%">
              <strong><p>Ensembl ID</p></strong>
            </div>
            <div style="width: 90%">
              <a
                :href="ENSEMBL_GENE_URL + geneData.ids.Ensembl"
                style="text-decoration: none"
                v-if="geneData.ids?.Ensembl"
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
