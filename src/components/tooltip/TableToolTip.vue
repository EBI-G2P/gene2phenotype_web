<script>
export default {
  props: {
    toolTipText: String,
  },
  mounted() {
    if (!window.bootstrap?.Tooltip) return;
    this.tooltip = new window.bootstrap.Tooltip(this.$refs.tooltipEl);
  },
  beforeUnmount() {
    this.tooltip?.dispose();
  },
  data() {
    return {
      tooltip: null,
    };
  },
};
</script>
<template>
  <span
    ref="tooltipEl"
    class="bi bi-info-circle"
    style="color: #0d6efd; font-size: 16px; cursor: pointer"
    data-bs-toggle="tooltip"
    data-bs-placement="top"
    :data-bs-title="toolTipText"
    tabindex="0"
    role="button"
    aria-label="More information"
  ></span>
</template>
