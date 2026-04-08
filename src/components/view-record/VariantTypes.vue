<script>
import {
  EUROPE_PMC_URL,
  SEQUENCE_ONTOLOGY_URL,
} from "../../utility/UrlConstants.js";
export default {
  props: {
    variantTypes: Array,
    isAuthenticated: Boolean,
  },
  data() {
    return {
      SEQUENCE_ONTOLOGY_URL,
      EUROPE_PMC_URL,
    };
  },
};
</script>
<template>
  <div
    v-if="variantTypes?.length > 0"
    class="accordion accordion-flush"
    id="accordionVariantTypes"
  >
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleVariantTypesTable"
          aria-expanded="false"
          aria-controls="collapsibleVariantTypesTable"
        >
          {{ variantTypes.map((x) => x.term).join(", ") }}
        </button>
      </h2>
      <div
        id="collapsibleVariantTypesTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionVariantTypes"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Inheritance</th>
                <th>Publications</th>
                <th v-if="isAuthenticated">Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in variantTypes">
                <td>
                  <a
                    v-if="item.accession"
                    :href="SEQUENCE_ONTOLOGY_URL + item.accession"
                    style="text-decoration: none"
                    target="_blank"
                  >
                    {{ item.term }}
                  </a>
                  <span v-else>{{ item.term }}</span>
                </td>
                <td>
                  <ul
                    v-if="
                      item.de_novo || item.inherited || item.unknown_inheritance
                    "
                    class="mb-0 ps-3"
                  >
                    <li v-if="item.de_novo">De Novo</li>
                    <li v-if="item.inherited">Inherited</li>
                    <li v-if="item.unknown_inheritance">Unknown Inheritance</li>
                  </ul>
                </td>
                <td>
                  <span v-if="item.publications?.length > 0">
                    <span v-for="(publicationItem, index) in item.publications">
                      <span v-if="index < item.publications.length - 1">
                        <a
                          :href="EUROPE_PMC_URL + publicationItem"
                          style="text-decoration: none"
                          target="_blank"
                        >
                          {{ publicationItem }}
                        </a>
                        ,
                      </span>
                      <a
                        v-else
                        :href="EUROPE_PMC_URL + publicationItem"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        {{ publicationItem }}
                      </a>
                    </span>
                  </span>
                </td>
                <td v-if="isAuthenticated">
                  <ul v-if="item.comments?.length > 0" class="mb-0 ps-3">
                    <li
                      v-for="commentItem in item.comments"
                      :key="commentItem.text"
                      style="white-space: pre-wrap"
                    >
                      {{ commentItem.text }} ({{ commentItem.date }})
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
  <p v-else class="text-muted">Not Available</p>
</template>
