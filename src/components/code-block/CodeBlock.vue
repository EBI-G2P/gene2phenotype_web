<script>
export default {
  data() {
    return {
      isCopied: false,
    };
  },
  methods: {
    copyCode() {
      const codeBlockInnerText = this.$refs.codeBlockRef.innerText;
      navigator.clipboard.writeText(codeBlockInnerText).then(() => {
        this.isCopied = true;
        setTimeout(() => {
          this.isCopied = false;
        }, 2000);
      });
    },
  },
};
</script>
<template>
  <div class="code-block position-relative">
    <pre><code ref="codeBlockRef"><slot></slot></code></pre>
    <button
      class="btn btn-sm position-absolute top-0 end-0 m-2"
      :class="isCopied ? 'bg-success-subtle' : 'bg-light'"
      @click="copyCode"
      :title="isCopied ? 'Copied!' : 'Copy code'"
    >
      <i :class="isCopied ? 'bi bi-clipboard-check' : 'bi bi-clipboard'"></i>
    </button>
  </div>
</template>
<style scoped>
.code-block {
  overflow-x: auto;
  position: relative;
  padding: 15px;
  background: #f4f4f4;
  border-radius: 5px;
  font-family: courier, monospace;
}
pre {
  margin: 0;
}
button {
  z-index: 10;
}
</style>
