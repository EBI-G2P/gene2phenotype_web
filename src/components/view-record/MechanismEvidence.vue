<script>
import { EUROPE_PMC_URL } from "../../utility/UrlConstants.js";
export default {
  props: {
    mechanismEvidence: Object,
  },
  data() {
    return {
      EUROPE_PMC_URL,
    };
  },
};
</script>
<template>
  <div class="accordion accordion-flush" id="accordionMechanismEvidence">
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleMechanismEvidenceTable"
          aria-expanded="false"
          aria-controls="collapsibleMechanismEvidenceTable"
        >
          Evidence ({{ Object.keys(mechanismEvidence).length }})
        </button>
      </h2>
      <div
        id="collapsibleMechanismEvidenceTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionMechanismEvidence"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Publication</th>
                <th>Functional Studies</th>
                <th>Descriptions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in mechanismEvidence">
                <td>
                  <a
                    :href="EUROPE_PMC_URL + key"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    {{ key }}
                  </a>
                </td>
                <td>
                  <ul
                    v-if="
                      Object.keys(value?.functional_studies || {}).length > 0
                    "
                    class="mb-0 ps-3"
                  >
                    <li
                      v-for="(
                        secondaryEvidenceTypeArray, primaryEvidenceType
                      ) in value.functional_studies"
                    >
                      {{ primaryEvidenceType }} :
                      {{
                        secondaryEvidenceTypeArray?.length > 0
                          ? secondaryEvidenceTypeArray.join(", ")
                          : null
                      }}
                    </li>
                  </ul>
                </td>
                <td>
                  <ul v-if="value?.descriptions?.length > 0" class="mb-0 ps-3">
                    <li
                      v-for="item in value.descriptions"
                      style="white-space: pre-wrap"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
