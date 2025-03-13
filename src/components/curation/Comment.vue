<script>
export default {
  props: {
    privateComment: String,
    publicComment: String,
  },
  emits: ["update:privateComment", "update:publicComment"],
};
</script>
<template>
  <div class="py-3">
    <label for="private-comment-input" class="form-label">
      Private comment
    </label>
    <textarea
      class="form-control"
      id="private-comment-input"
      rows="3"
      type="text"
      :value="privateComment"
      @input="$emit('update:privateComment', $event.target.value)"
    >
    </textarea>
  </div>
  <div class="pb-3">
    <label for="public-comment-input" class="form-label">
      Public comment
    </label>
    <textarea
      class="form-control"
      id="public-comment-input"
      rows="3"
      type="text"
      :value="publicComment"
      @input="$emit('update:publicComment', $event.target.value)"
    >
    </textarea>
  </div>
</template>
