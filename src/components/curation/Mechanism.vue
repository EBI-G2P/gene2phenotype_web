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
              <div class="col-2">
                <p class="col-form-label">Badoyni et al probabilities</p>
              </div>
              <div class="col-md-3">
                <label for="gain-of-function-input" class="form-label">
                  Gain of Function
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="gain-of-function-input"
                  disabled
                  value="Not Available"
                />
              </div>
              <div class="col-md-3">
                <label for="loss-of-function-input" class="form-label">
                  Loss of Function
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="loss-of-function-input"
                  disabled
                  value="Not Available"
                />
              </div>
              <div class="col-md-3">
                <label for="dominant-negative-input" class="form-label">
                  Dominant Negative
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="dominant-negative-input"
                  disabled
                  value="Not Available"
                />
              </div>
            </div>
            <div class="row g-3 px-3 pt-4">
              <div class="col-2">
                <label for="mechanism-input" class="col-form-label">
                  Mechanism
                </label>
              </div>
              <div class="col-3">
                <select
                  id="mechanism-input"
                  class="form-select"
                  :value="molecularMechanism"
                  @input="
                    $emit('update:molecularMechanism', $event.target.value)
                  "
                >
                  <option disabled value="">Select</option>
                  <option v-for="item in mechanismAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
              <div class="col-3">
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
                  <option disabled value="">Select Source</option>
                  <option v-for="item in mechanismSupportAttribs" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row g-3 px-3 py-3">
              <div class="col-2">
                <label for="categorisation-input" class="col-form-label"
                  >Categorisation</label
                >
              </div>
              <div class="col-3">
                <select
                  id="categorisation-input"
                  class="form-select"
                  :value="mechanismSynopsis"
                  @input="
                    $emit('update:mechanismSynopsis', $event.target.value)
                  "
                >
                  <option disabled value="">Select</option>
                  <option
                    v-for="item in mechanismSynopsisAttribs"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
              </div>
              <div class="col-3">
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
                  <option disabled value="">Select Source</option>
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
