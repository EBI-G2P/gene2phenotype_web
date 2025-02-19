<script>
import MechanismEvidence from "./MechanismEvidence.vue";
import ToolTip from "../tooltip/ToolTip.vue";
import {
  MechanismAttribs,
  MechanismSynopsisAttribs,
  MechanismSupportAttribs,
} from "../../utility/CurationConstants";
import {
  HELP_TEXT,
  MARSH_PROBABILITY_THRESHOLD,
} from "../../utility/Constants";

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
      marshProbabilityThreshold: { ...MARSH_PROBABILITY_THRESHOLD },
      helpText: { ...HELP_TEXT },
    };
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
                <ToolTip :toolTipText="helpText.MARSH_PROBABILITY" />
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
                        <ToolTip :toolTipText="helpText.GAIN_OF_FUNCTION" />
                      </td>
                      <td width="40%">
                        <span
                          v-if="
                            mechanismGeneStats?.gain_of_function_mp >
                            marshProbabilityThreshold.GAIN_OF_FUNCTION
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.gain_of_function_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.gain_of_function_mp <=
                            marshProbabilityThreshold.GAIN_OF_FUNCTION
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
                        <ToolTip :toolTipText="helpText.LOSS_OF_FUNCTION" />
                      </td>
                      <td width="40%">
                        <span
                          v-if="
                            mechanismGeneStats?.loss_of_function_mp >
                            marshProbabilityThreshold.LOSS_OF_FUNCTION
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.loss_of_function_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.loss_of_function_mp <=
                            marshProbabilityThreshold.LOSS_OF_FUNCTION
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
                        <ToolTip :toolTipText="helpText.DOMINANT_NEGATIVE" />
                      </td>
                      <td width="40%">
                        <span
                          v-if="
                            mechanismGeneStats?.dominant_negative_mp >
                            marshProbabilityThreshold.DOMINANT_NEGATIVE
                          "
                          class="badge red-text-box"
                        >
                          {{ mechanismGeneStats.dominant_negative_mp }}
                        </span>
                        <span
                          v-else-if="
                            mechanismGeneStats?.dominant_negative_mp <=
                            marshProbabilityThreshold.DOMINANT_NEGATIVE
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
                  class="form-select"
                  :value="molecularMechanism"
                  @input="
                    $emit('update:molecularMechanism', $event.target.value)
                  "
                >
                  <option value="">Select</option>
                  <option v-for="item in mechanismAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="mechanism-input-source"
                  class="form-select"
                  :value="molecularMechanismSupport"
                  @input="
                    $emit(
                      'update:molecularMechanismSupport',
                      $event.target.value
                    )
                  "
                >
                  <option value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
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
                  class="form-select"
                  :value="mechanismSynopsis"
                  @input="
                    $emit('update:mechanismSynopsis', $event.target.value)
                  "
                >
                  <option value="">Select</option>
                  <option
                    v-for="item in mechanismSynopsisAttribs"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
              </div>
              <div class="col-xl-3 col-lg-3 col-6">
                <select
                  id="categorisation-input-source"
                  class="form-select"
                  :value="mechanismSynopsisSupport"
                  @input="
                    $emit(
                      'update:mechanismSynopsisSupport',
                      $event.target.value
                    )
                  "
                >
                  <option value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
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
