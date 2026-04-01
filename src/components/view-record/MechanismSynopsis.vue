<script>
export default {
  props: {
    mechanismSynopsis: Array,
  },
};
</script>
<template>
  <div
    v-if="mechanismSynopsis?.length > 0"
    class="accordion accordion-flush"
    id="accordionMechanismSynopsis"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleMechanismSynopsisTable"
          aria-expanded="false"
          aria-controls="collapsibleMechanismSynopsisTable"
        >
          {{ mechanismSynopsis.map((x) => x.synopsis).join(", ") }}
        </button>
      </h2>
      <div
        id="collapsibleMechanismSynopsisTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionMechanismSynopsis"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Categorisation</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mechanismSynopsis">
                <td>
                  {{ item.synopsis }}
                </td>
                <td>
                  {{ item.support }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="text-muted">Not Available</p>
</template>
