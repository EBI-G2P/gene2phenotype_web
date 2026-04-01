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
            :href="DECIPHER_URL + geneSymbol"
            style="text-decoration: none"
            target="_blank"
          >
            {{ geneSymbol }}
          </a>
          <p v-else class="text-muted">Not Available</p>
        </td>
        <td>
          <a
            v-if="omimId"
            :href="OMIM_URL + omimId"
            style="text-decoration: none"
            target="_blank"
          >
            {{ omimId }}
          </a>
          <p v-else class="text-muted">Not Available</p>
        </td>
        <td>
          <a
            v-if="ensemblId"
            :href="ENSEMBL_GENE_URL + ensemblId"
            style="text-decoration: none"
            target="_blank"
          >
            {{ ensemblId }}
          </a>
          <p v-else class="text-muted">Not Available</p>
        </td>
        <td>
          <a
            v-if="hgncId"
            :href="HGNC_URL + hgncId"
            style="text-decoration: none"
            target="_blank"
          >
            {{ hgncId }}
          </a>
          <p v-else class="text-muted">Not Available</p>
        </td>
      </tr>
    </tbody>
  </table>
</template>
