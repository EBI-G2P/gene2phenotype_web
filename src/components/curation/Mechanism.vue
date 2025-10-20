<script>
import MechanismEvidence from "./MechanismEvidence.vue";
import ToolTip from "../tooltip/ToolTip.vue";
import {
  MechanismAttribs,
  MechanismSynopsisAttribs,
  MechanismSupportAttribs,
} from "../../utility/CurationConstants.js";
import {
  HELP_TEXT,
  MARSH_PROBABILITY_THRESHOLD,
} from "../../utility/Constants.js";

export default {
  props: {
    molecularMechanism: String,
    molecularMechanismSupport: String,
    mechanismSynopsis: Object,
    mechanismEvidence: Object,
    mechanismGeneStats: Object,
  },
  emits: [
    "update:molecularMechanism",
    "update:molecularMechanismSupport",
    "updateMechanismSynopsis",
    "updateMechanismEvidence",
  ],
  components: {
    MechanismEvidence,
    ToolTip,
  },
  data() {
    return {
      mechanismAttribs: [...MechanismAttribs],
      mechanismSynopsisAttribs: [...MechanismSynopsisAttribs],
      mechanismSupportAttribs: [...MechanismSupportAttribs],
      MARSH_PROBABILITY_THRESHOLD,
      HELP_TEXT,
    };
  },
  methods: {
    mechanismSynopsisInputHandler(key, inputValue) {
      let updatedMechanismSynopsis = { ...this.mechanismSynopsis };
      updatedMechanismSynopsis[key] = inputValue;
      this.$emit("updateMechanismSynopsis", updatedMechanismSynopsis);
    },
  },
  computed: {
    molecularMechanismErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. molecularMechanism is empty and molecularMechanismSupport is defined
      // 2. molecularMechanism is empty and any value of mechanismSynopsis obj is not blank

      if (
        !this.molecularMechanism &&
        (this.molecularMechanismSupport ||
          Object.values(this.mechanismSynopsis).some((item) => item !== ""))
      ) {
        return "Select Mechanism";
      }
      return null;
    },
    molecularMechanismSupportErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. molecularMechanismSupport is set to 'inferred' or 'evidence' and molecularMechanism is set to 'undetermined'
      // 2. molecularMechanismSupport is empty and molecularMechanism is set to any value except 'undetermined'
      // 3. molecularMechanismSupport is empty and any value of mechanismSynopsis obj is not blank

      if (
        (this.molecularMechanismSupport === "inferred" ||
          this.molecularMechanismSupport === "evidence") &&
        this.molecularMechanism === "undetermined"
      ) {
        return `Mechanism source can not be set to '${this.molecularMechanismSupport}' for 'undetermined' Mechanism`;
      } else if (
        !this.molecularMechanismSupport &&
        this.molecularMechanism &&
        this.molecularMechanism !== "undetermined"
      ) {
        return "Select source";
      } else if (
        !this.molecularMechanismSupport &&
        Object.values(this.mechanismSynopsis).some((item) => item !== "")
      ) {
        return "Select source";
      }
      return null;
    },
  },
};
</script>
<template>
  <div class="accordion py-1" id="mechanism-section">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mechanism-section-body"
          aria-expanded="false"
          aria-controls="mechanism-section-body"
        >
          Mechanism
        </button>
      </h2>
      <div id="mechanism-section-body" class="accordion-collapse collapse">
        <div class="accordion-body">
          <form>
            <div class="row g-3 px-3">
              <p class="mb-0 fw-bold">
                Badoyni et al probabilities
                <ToolTip :toolTipText="HELP_TEXT.MARSH_PROBABILITY" />
              </p>
              <p class="mb-0 mt-1">
                See
                <a
                  href="https://europepmc.org/article/MED/39172982"
                  target="_blank"
                  style="text-decoration: none"
                  >Badonyi and Marsh, 2024</a
                >
              </p>
              <div class="col-xl-5 col-lg-6">
                <table class="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <td style="width: 60%">
                        Gain of Function (pGOF)
                        <ToolTip :toolTipText="HELP_TEXT.GAIN_OF_FUNCTION" />
                      </td>
                      <td style="width: 40%">
                        <span
                          v-if="
                            mechanismGeneStats?.gain_of_function_mp >
                            MARSH_PROBABILITY_THRESHOLD.GAIN_OF_FUNCTION
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.gain_of_function_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.gain_of_function_mp <=
                            MARSH_PROBABILITY_THRESHOLD.GAIN_OF_FUNCTION
                          "
                          class="badge green-text-box"
                        >
                          {{ mechanismGeneStats.gain_of_function_mp }}
                        </span>
                        <span v-else class="text-muted">Not Available</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 60%">
                        Loss of Function (pLOF)
                        <ToolTip :toolTipText="HELP_TEXT.LOSS_OF_FUNCTION" />
                      </td>
                      <td style="width: 40%">
                        <span
                          v-if="
                            mechanismGeneStats?.loss_of_function_mp >
                            MARSH_PROBABILITY_THRESHOLD.LOSS_OF_FUNCTION
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.loss_of_function_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.loss_of_function_mp <=
                            MARSH_PROBABILITY_THRESHOLD.LOSS_OF_FUNCTION
                          "
                          class="badge green-text-box"
                        >
                          {{ mechanismGeneStats.loss_of_function_mp }}
                        </span>
                        <span v-else class="text-muted">Not Available</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 60%">
                        Dominant Negative (pDN)
                        <ToolTip :toolTipText="HELP_TEXT.DOMINANT_NEGATIVE" />
                      </td>
                      <td style="width: 40%">
                        <span
                          v-if="
                            mechanismGeneStats?.dominant_negative_mp >
                            MARSH_PROBABILITY_THRESHOLD.DOMINANT_NEGATIVE
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.dominant_negative_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.dominant_negative_mp <=
                            MARSH_PROBABILITY_THRESHOLD.DOMINANT_NEGATIVE
                          "
                          class="badge green-text-box"
                        >
                          {{ mechanismGeneStats.dominant_negative_mp }}
                        </span>
                        <span v-else class="text-muted">Not Available</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="mb-0 fw-bold">gnomAD constraint metrics</p>
              <div class="col-xl-5 col-lg-6">
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <td style="width: 60%">
                        pLI (probability of being loss-of-function intolerant)
                      </td>
                      <td style="width: 40%">
                        <span
                          v-if="
                            mechanismGeneStats?.pli_gnomAD != null &&
                            mechanismGeneStats?.pli_gnomAD !== ''
                          "
                        >
                          {{ mechanismGeneStats.pli_gnomAD }}
                        </span>
                        <span v-else class="text-muted">Not Available</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 60%">
                        LOEUF (loss-of-function observed/expected upper bound
                        fraction)
                      </td>
                      <td style="width: 40%">
                        <span
                          v-if="
                            mechanismGeneStats?.loeuf_gnomAD != null &&
                            mechanismGeneStats?.loeuf_gnomAD !== ''
                          "
                        >
                          {{ mechanismGeneStats.loeuf_gnomAD }}
                        </span>
                        <span v-else class="text-muted">Not Available</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <hr />
            <div class="row g-3 px-3 pt-3">
              <div class="col-lg-2">
                <label for="mechanism-input" class="col-form-label">
                  Mechanism<span class="text-danger">*</span>
                </label>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="mechanism-input"
                  :class="
                    molecularMechanismErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="molecularMechanism"
                  @input="
                    $emit('update:molecularMechanism', $event.target.value)
                  "
                  aria-describedby="invalid-mechanism-input-feedback"
                >
                  <option value="">Select</option>
                  <option v-for="item in mechanismAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-mechanism-input-feedback"
                  class="invalid-feedback"
                >
                  {{ molecularMechanismErrorMsg }}
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="mechanism-input-source"
                  :class="
                    molecularMechanismSupportErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="molecularMechanismSupport"
                  @input="
                    $emit(
                      'update:molecularMechanismSupport',
                      $event.target.value
                    )
                  "
                  aria-describedby="invalid-mechanism-input-source-feedback"
                >
                  <option value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-mechanism-input-source-feedback"
                  class="invalid-feedback"
                >
                  {{ molecularMechanismSupportErrorMsg }}
                </div>
              </div>
            </div>
            <div class="row g-3 px-3 py-3">
              <p class="mb-0">Categorisation</p>
              <div class="col-xl-6 col-12">
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th style="width: 60%">
                        Categorisation
                        <a
                          href="/gene2phenotype/about/terminology#mechanism-synopsis-section"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          <i class="bi bi-question-circle"></i>
                        </a>
                      </th>
                      <th style="width: 40%">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in mechanismSynopsisAttribs" :key="item">
                      <td>
                        {{ item }}
                      </td>
                      <td>
                        <select
                          :id="`categorisation-input-source-${item}`"
                          :class="
                            // Following condition will display an error message:
                            // molecularMechanismSupport is set to 'inferred' and mechanismSynopsis[item] is set to 'evidence'
                            molecularMechanismSupport === 'inferred' &&
                            mechanismSynopsis[item] === 'evidence'
                              ? 'form-select is-invalid'
                              : 'form-select'
                          "
                          :value="mechanismSynopsis[item]"
                          @input="
                            mechanismSynopsisInputHandler(
                              item,
                              $event.target.value
                            )
                          "
                          :aria-describedby="`invalid-categorisation-input-source-feedback-${item}`"
                        >
                          >
                          <option value="">Select</option>
                          <option
                            v-for="support in mechanismSupportAttribs"
                            :value="support"
                          >
                            {{ support }}
                          </option>
                        </select>
                        <div
                          :id="`invalid-categorisation-input-source-feedback-${item}`"
                          class="invalid-feedback"
                        >
                          Categorisation source can not be set to 'evidence' if
                          Mechanism source is 'inferred'
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <MechanismEvidence
              :molecularMechanismSupport="molecularMechanismSupport"
              :mechanismEvidence="mechanismEvidence"
              @update-mechanism-evidence="
                (updatedMechanismEvidence) =>
                  $emit('updateMechanismEvidence', updatedMechanismEvidence)
              "
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.red-text-box {
  color: white;
  background-color: rgb(255, 21, 0);
}
.green-text-box {
  color: black;
  background-color: rgb(0, 243, 148);
}
</style>
