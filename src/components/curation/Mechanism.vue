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
    mechanismSynopsis: String,
    mechanismSynopsisSupport: String,
    mechanismEvidence: Object,
    mechanismGeneStats: Object,
  },
  emits: [
    "update:molecularMechanism",
    "update:molecularMechanismSupport",
    "update:mechanismSynopsis",
    "update:mechanismSynopsisSupport",
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
  computed: {
    molecularMechanismErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. molecularMechanism is empty and molecularMechanismSupport is defined
      // 2. molecularMechanism is empty and mechanismSynopsis is defined

      if (
        !this.molecularMechanism &&
        (this.molecularMechanismSupport || this.mechanismSynopsis)
      ) {
        return "Select Mechanism";
      }
      return null;
    },
    molecularMechanismSupportErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. molecularMechanismSupport is set to 'inferred' or 'evidence' and molecularMechanism is set to 'undetermined'
      // 2. molecularMechanismSupport is empty and molecularMechanism is set to any value except 'undetermined'
      // 3. molecularMechanismSupport is empty and mechanismSynopsisSupport is set to 'inferred' or 'evidence'

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
        (this.mechanismSynopsisSupport === "inferred" ||
          this.mechanismSynopsisSupport === "evidence")
      ) {
        return "Select source";
      }
      return null;
    },
    mechanismSynopsisErrorMsg() {
      // Following condition will return an error message:
      // 1. mechanismSynopsis is empty and mechanismSynopsisSupport is defined

      if (!this.mechanismSynopsis && this.mechanismSynopsisSupport) {
        return "Select Categorisation";
      }
      return null;
    },
    mechanismSynopsisSupportErrorMsg() {
      // Any of following conditions will return an error message:
      // 1. mechanismSynopsisSupport is empty and mechanismSynopsis is defined
      // 2. mechanismSynopsisSupport is set to 'evidence' and molecularMechanismSupport is set to 'inferred'

      if (!this.mechanismSynopsisSupport && this.mechanismSynopsis) {
        return "Select source";
      } else if (
        this.mechanismSynopsisSupport === "evidence" &&
        this.molecularMechanismSupport === "inferred"
      ) {
        return "Categorisation source can not be set to 'evidence' if Mechanism source is 'inferred'";
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
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <td width="60%">
                        Gain of Function (pGOF)
                        <ToolTip :toolTipText="HELP_TEXT.GAIN_OF_FUNCTION" />
                      </td>
                      <td width="40%">
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
                      <td width="60%">
                        Loss of Function (pLOF)
                        <ToolTip :toolTipText="HELP_TEXT.LOSS_OF_FUNCTION" />
                      </td>
                      <td width="40%">
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
                      <td width="60%">
                        Dominant Negative (pDN)
                        <ToolTip :toolTipText="HELP_TEXT.DOMINANT_NEGATIVE" />
                      </td>
                      <td width="40%">
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
              <div class="col-lg-2">
                <label for="categorisation-input" class="col-form-label">
                  Categorisation
                </label>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="categorisation-input"
                  :class="
                    mechanismSynopsisErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="mechanismSynopsis"
                  @input="
                    $emit('update:mechanismSynopsis', $event.target.value)
                  "
                  aria-describedby="invalid-categorisation-input-feedback"
                >
                  <option value="">Select</option>
                  <option
                    v-for="item in mechanismSynopsisAttribs"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-categorisation-input-feedback"
                  class="invalid-feedback"
                >
                  {{ mechanismSynopsisErrorMsg }}
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="categorisation-input-source"
                  :class="
                    mechanismSynopsisSupportErrorMsg
                      ? 'form-select is-invalid'
                      : 'form-select'
                  "
                  :value="mechanismSynopsisSupport"
                  @input="
                    $emit(
                      'update:mechanismSynopsisSupport',
                      $event.target.value
                    )
                  "
                  aria-describedby="invalid-categorisation-input-source-feedback"
                >
                  <option value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
                <div
                  id="invalid-categorisation-input-source-feedback"
                  class="invalid-feedback"
                >
                  {{ mechanismSynopsisSupportErrorMsg }}
                </div>
              </div>
            </div>
            <MechanismEvidence
              :molecularMechanismSupport="molecularMechanismSupport"
              :mechanismSynopsisSupport="mechanismSynopsisSupport"
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
