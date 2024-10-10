<script>
import MechanismEvidence from "./MechanismEvidence.vue";
import {
  MechanismAttribs,
  MechanismSynopsisAttribs,
  MechanismSupportAttribs,
} from "../../utility/CurationConstants";
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
  components: { MechanismEvidence },
  data() {
    return {
      mechanismAttribs: [...MechanismAttribs],
      mechanismSynopsisAttribs: [...MechanismSynopsisAttribs],
      mechanismSupportAttribs: [...MechanismSupportAttribs],
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
              <p class="mb-0 fw-bold">Badoyni et al probabilities</p>
              <div class="col-xl-4 col-lg-6">
                <table class="table table-bordered">
                  <tbody>
                    <tr>
                      <th width="50%">Gain of Function</th>
                      <td width="50%">
                        {{
                          mechanismGeneStats?.gain_of_function_mp
                            ? mechanismGeneStats.gain_of_function_mp
                            : "Not Available"
                        }}
                      </td>
                    </tr>
                    <tr>
                      <th width="50%">Loss of Function</th>
                      <td width="50%">
                        {{
                          mechanismGeneStats?.loss_of_function_mp
                            ? mechanismGeneStats.loss_of_function_mp
                            : "Not Available"
                        }}
                      </td>
                    </tr>
                    <tr>
                      <th width="50%">Dominant Negative</th>
                      <td width="50%">
                        {{
                          mechanismGeneStats?.dominant_negative_mp
                            ? mechanismGeneStats.dominant_negative_mp
                            : "Not Available"
                        }}
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
