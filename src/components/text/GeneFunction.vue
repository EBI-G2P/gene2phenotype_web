<script>
import { EUROPE_PMC_URL, UNIPROT_URL } from "../../utility/UrlConstants.js";
import { MAX_CHARACTERS } from "../../utility/Constants.js";
export default {
  props: {
    geneFunctionText: String,
    uniprotAccession: String,
    uniprotSection: {
      type: String,
      default: null,
    },
    linkLabel: {
      type: String,
      default: "Source",
    },
  },
  data() {
    return {
      isTextExpanded: false,
      fullGeneFunctionText: "",
      truncatedGeneFunctionText: "",
      MAX_CHARACTERS,
      EUROPE_PMC_URL,
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
    displayedParts() {
      return this.parsePubMedReferences(this.displayedText);
    },
    uniprotHref() {
      if (!this.uniprotAccession) {
        return null;
      }

      const baseHref = `${UNIPROT_URL}${this.uniprotAccession}/entry`;
      return this.uniprotSection
        ? `${baseHref}#${this.uniprotSection}`
        : baseHref;
    },
  },
  methods: {
    processGeneFunctionText() {
      const geneFunctionText = this.geneFunctionText || "";

      this.fullGeneFunctionText = geneFunctionText;

      if (geneFunctionText.length > MAX_CHARACTERS) {
        this.truncatedGeneFunctionText =
          geneFunctionText.slice(0, MAX_CHARACTERS) + "...";
      } else {
        this.truncatedGeneFunctionText = geneFunctionText;
      }
    },
    parsePubMedReferences(text) {
      // Example: "Sample PubMed:123." becomes
      // [{ type: "text", text: "Sample " }, { type: "pubmed", id: "123" }, ...]
      const parts = [];
      const regex = /PubMed:(\d+)/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        // Keep the plain text before this PubMed reference
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            text: text.slice(lastIndex, match.index),
          });
        }
        // Store only the numeric ID so Vue can build the link safely
        parts.push({
          type: "pubmed",
          id: match[1],
        });
        lastIndex = regex.lastIndex;
      }
      // Keep any text after the final PubMed reference
      if (lastIndex < text.length) {
        parts.push({
          type: "text",
          text: text.slice(lastIndex),
        });
      }
      return parts;
    },
    toggleText() {
      this.isTextExpanded = !this.isTextExpanded;
    },
  },
};
</script>
<template>
  <div>
    <p class="mb-0">
      <template v-for="(part, index) in displayedParts" :key="index">
        <a
          v-if="part.type === 'pubmed'"
          :href="EUROPE_PMC_URL + part.id"
          target="_blank"
          rel="noopener noreferrer"
          >PubMed:{{ part.id }}</a
        >
        <span v-else>{{ part.text }}</span>
      </template>
    </p>
    <button
      v-if="fullGeneFunctionText.length > MAX_CHARACTERS"
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
      <b>{{ linkLabel }}:</b>
      <a
        :href="uniprotHref"
        style="text-decoration: none"
        target="_blank"
        rel="noopener noreferrer"
      >
        UniProt
        <i class="bi bi-box-arrow-up-right"></i>
      </a>
    </p>
  </div>
</template>
