<script>
import {
  DECIPHER_URL,
  ENSEMBL_GENE_URL,
  HGNC_URL,
  OMIM_URL,
} from "../../utility/UrlConstants.js";
export default {
  props: {
    geneSymbol: String,
    omimId: String,
    ensemblId: String,
    hgncId: String,
  },
  data() {
    return {
      DECIPHER_URL,
      OMIM_URL,
      ENSEMBL_GENE_URL,
      HGNC_URL,
    };
  },
};
</script>
<template>
  <div class="table-responsive">
    <table class="table table-bordered mb-0">
      <thead>
        <tr>
          <th>DECIPHER</th>
          <th>OMIM</th>
          <th>Ensembl ID</th>
          <th>HGNC ID</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <a
              v-if="geneSymbol"
              class="text-decoration-none"
              :href="DECIPHER_URL + geneSymbol"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ geneSymbol }}
            </a>
            <p v-else class="text-muted">Not Available</p>
          </td>
          <td>
            <a
              v-if="omimId"
              class="text-decoration-none"
              :href="OMIM_URL + omimId"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ omimId }}
            </a>
            <p v-else class="text-muted">Not Available</p>
          </td>
          <td>
            <a
              v-if="ensemblId"
              class="text-decoration-none"
              :href="ENSEMBL_GENE_URL + ensemblId"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ ensemblId }}
            </a>
            <p v-else class="text-muted">Not Available</p>
          </td>
          <td>
            <a
              v-if="hgncId"
              class="text-decoration-none"
              :href="HGNC_URL + hgncId"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ hgncId }}
            </a>
            <p v-else class="text-muted">Not Available</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
