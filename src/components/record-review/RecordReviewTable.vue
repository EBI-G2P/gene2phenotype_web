<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    emptyMessage: {
      type: String,
      required: true,
    },
    muted: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      expandedSummaryIds: {},
    };
  },
  methods: {
    isSummaryExpanded(id) {
      return !!this.expandedSummaryIds[id];
    },
    toggleSummary(id) {
      this.expandedSummaryIds = {
        ...this.expandedSummaryIds,
        [id]: !this.expandedSummaryIds[id],
      };
    },
    shouldTruncateSummary(summary) {
      if (!summary) return false;
      return String(summary).length > 50;
    },
    truncateSummary(summary) {
      if (!summary) return "";
      const text = String(summary);
      return text.length > 50 ? `${text.slice(0, 50)}...` : text;
    },
    listComponents(items) {
      if (!Array.isArray(items) || items.length === 0) return "";
      const names = items
        .filter((item) => item?.status !== "resolved")
        .map((item) => item?.component)
        .filter((component) => component);
      if (names.length === 0) return "";
      return Array.from(new Set(names));
    },
  },
};
</script>

<template>
  <table
    class="table table-hover table-bordered"
    :class="{ 'table-secondary': muted }"
    v-if="items.length > 0"
  >
    <thead>
      <tr>
        <th>Case ID</th>
        <th>G2P ID</th>
        <th>Summary</th>
        <th>Data to update</th>
        <th>Status</th>
        <th>Created by</th>
        <th>Date created</th>
        <th>Last Updated</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>
          <router-link
            :to="`/record-review-update/${item.id}`"
            style="text-decoration: none"
          >
            {{ item.id }}
          </router-link>
        </td>
        <td>
          <a
            :href="`/gene2phenotype/lgd/${item.stable_id}`"
            style="text-decoration: none"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.stable_id }}
          </a>
        </td>
        <td>
          <span v-if="!item.summary"></span>
          <span v-else-if="isSummaryExpanded(item.id)">
            {{ item.summary }}
            <button
              v-if="isSummaryTruncated(item.summary)"
              type="button"
              class="btn btn-link p-0 align-baseline"
              style="text-decoration: none"
              @click="toggleSummary(item.id)"
            >
              Show less
              <i class="bi bi-dash-circle"></i>
            </button>
          </span>
          <span v-else>
            {{ truncateSummary(item.summary) }}
            <button
              v-if="shouldTruncateSummary(item.summary)"
              type="button"
              class="btn btn-link p-0 align-baseline"
              style="text-decoration: none"
              @click="toggleSummary(item.id)"
            >
              Show more
              <i class="bi bi-plus-circle"></i>
            </button>
          </span>
        </td>
        <td>
          <div
            v-if="listComponents(item.items).length > 0"
            class="d-flex flex-wrap gap-1"
          >
            <span
              v-for="component in listComponents(item.items)"
              :key="component"
              class="badge bg-secondary"
            >
              {{ component }}
            </span>
          </div>
          <span v-else>-</span>
        </td>
        <td>{{ item.status }}</td>
        <td>{{ item.created_by }}</td>
        <td>{{ item.date_created }}</td>
        <td>{{ item.date_last_update }}</td>
      </tr>
    </tbody>
  </table>
  <p class="text-dark" v-else>{{ emptyMessage }}</p>
</template>
