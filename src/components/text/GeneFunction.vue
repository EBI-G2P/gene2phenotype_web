<script>
import { EUROPE_PMC_URL, UNIPROT_URL } from "../../utility/UrlConstants.js";
import { MAX_CHARACTERS } from "../../utility/Constants.js";
export default {
  props: {
    geneFunctionText: String,
    uniprotAccession: String,
  },
  data() {
    return {
      isTextExpanded: false,
      fullGeneFunctionText: "",
      truncatedGeneFunctionText: "",
      MAX_CHARACTERS,
      UNIPROT_URL,
    };
  },
  watch: {
    geneFunctionText: {
      handler() {
        this.processGeneFunctionText();
      },
      immediate: true,
    },
  },
  computed: {
    displayedText() {
      return this.isTextExpanded
        ? this.fullGeneFunctionText
        : this.truncatedGeneFunctionText;
    },
  },
  methods: {
    processGeneFunctionText() {
      // Replace PubMed text in geneFunctionText with link to EuropePMC
      // Ex: If geneFunctionText contains the text PubMed:12345678
      // then it will be replaced with
      // <a href="https://europepmc.org/article/MED/12345678" target="_blank">PubMed:12345678</a>
      const fullReplacedGeneFunctionText = this.geneFunctionText.replace(
        /PubMed:(\d+)/g,
        (match, num) =>
          `<a href="${EUROPE_PMC_URL}${num}" target="_blank">PubMed:${num}</a>`
      );
      this.fullGeneFunctionText = fullReplacedGeneFunctionText;

      if (this.geneFunctionText.length > MAX_CHARACTERS) {
        let truncatedGeneFunctionText =
          this.geneFunctionText.slice(0, MAX_CHARACTERS) + "&hellip;";

        // Replace PubMed text in truncatedGeneFunctionText with link to EuropePMC
        // Ex: If truncatedGeneFunctionText contains the text PubMed:12345678
        // then it will be replaced with
        // <a href="https://europepmc.org/article/MED/12345678" target="_blank">PubMed:12345678</a>
        const truncatedReplacedGeneFunctionText =
          truncatedGeneFunctionText.replace(
            /PubMed:(\d+)/g,
            (match, num) =>
              `<a href="${EUROPE_PMC_URL}${num}" target="_blank">PubMed:${num}</a>`
          );
        this.truncatedGeneFunctionText = truncatedReplacedGeneFunctionText;
      } else {
        // IF length of geneFunctionText <= MAX_CHARACTERS
        // THEN truncatedGeneFunctionText is equal to fullGeneFunctionText
        this.truncatedGeneFunctionText = fullReplacedGeneFunctionText;
      }
    },
    toggleText() {
      this.isTextExpanded = !this.isTextExpanded;
    },
  },
};
</script>
<template>
  <div>
    <p v-html="displayedText" class="mb-0"></p>
    <button
      v-if="geneFunctionText.length > MAX_CHARACTERS"
      @click="toggleText"
      class="btn btn-link p-0"
      style="text-decoration: none"
    >
      {{ isTextExpanded ? "Show less" : "Show more" }}
      <i
        :class="isTextExpanded ? 'bi bi-dash-circle' : 'bi bi-plus-circle'"
      ></i>
    </button>
    <p class="mb-0">
      <b>Source:</b>
      <a
        :href="UNIPROT_URL + uniprotAccession"
        style="text-decoration: none"
        target="_blank"
      >
        UniProt
        <i class="bi bi-box-arrow-up-right"></i>
      </a>
    </p>
  </div>
</template>
