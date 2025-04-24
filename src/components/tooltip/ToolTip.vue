<script>
export default {
  props: {
    toolTipText: String,
  },
};
</script>
<template>
  <span class="bi bi-info-circle custom-tooltip">
    <span class="custom-tooltip-text">
      {{ toolTipText }}
    </span>
  </span>
</template>
<style scoped>
.custom-tooltip {
  position: relative;
  display: inline-block;
  color: #0d6efd;
  white-space: normal;
  font-size: 16px;
}

.custom-tooltip .custom-tooltip-text {
  visibility: hidden;
  width: 200px;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 5;
  bottom: 125%;
  left: 30%;
  margin-left: -97px;
  opacity: 0;
  transition: opacity 0.3s;
  background-color: #000;
  color: #fff;
  text-align: center;
  font-size: 12px;
}

.custom-tooltip .custom-tooltip-text::after {
  border-width: 5px;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
}

.custom-tooltip:hover .custom-tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
