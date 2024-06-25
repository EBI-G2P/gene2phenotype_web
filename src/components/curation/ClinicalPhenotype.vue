<script>
export default {
  props: {
    clinicalPhenotype: Object,
  },
  emits: ["update:clinicalPhenotype"],
  methods: {
    inputHandler(pmid, inputValue) {
      let updateClinicalPhenotype = { ...this.clinicalPhenotype };
      updateClinicalPhenotype[pmid].summary = inputValue;
      this.$emit("update:clinicalPhenotype", updateClinicalPhenotype);
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="clinical-phenotype-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#clinical-phenotype-section-body"
          aria-expanded="false"
          aria-controls="clinical-phenotype-section-body"
        >
          Phenotypic Features
        </button>
      </h2>
      <div
        id="clinical-phenotype-section-body"
        class="accordion-collapse collapse"
      >
        <div class="accordion-body">
          <div
            class="row g-3 px-3 py-3"
            v-for="pmid in Object.keys(clinicalPhenotype)"
            v-if="
              clinicalPhenotype && Object.keys(clinicalPhenotype).length > 0
            "
          >
            <div class="col-12">
              <strong
                ><p class="mb-0">Publication (PMID: {{ pmid }})</p></strong
              >
            </div>
            <div class="col-1">
              <label
                :for="`clinical-phenotype-input-${pmid}`"
                class="col-form-label"
              >
                Summary
              </label>
            </div>
            <div class="col-4">
              <textarea
                class="form-control"
                :id="`clinical-phenotype-input-${pmid}`"
                rows="3"
                :value="clinicalPhenotype[pmid].summary"
                @input="inputHandler(pmid, $event.target.value)"
              >
              </textarea>
            </div>
          </div>
          <div class="row g-3 px-3 py-3" v-else>
            <p>
              <i class="bi bi-info-circle"></i> Please enter Publication(s) to
              fill this section.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
