<script>
export default {
  props: {
    comments: Array,
  },
};
</script>
<template>
  <div class="accordion accordion-flush" id="accordionComments">
    <div class="accordion-item">
      <h2 class="accordion-header border">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleCommentsTable"
          aria-expanded="false"
          aria-controls="collapsibleCommentsTable"
        >
          Comments ({{ comments.length }})
        </button>
      </h2>
      <div
        id="collapsibleCommentsTable"
        class="accordion-collapse collapse"
        data-bs-parent="#accordionComments"
      >
        <div class="accordion-body p-0">
          <table class="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Comment</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="commentObj in comments">
                <td style="white-space: pre-wrap">
                  {{ commentObj.text }}
                </td>
                <td>
                  {{
                    commentObj.is_public == 1
                      ? "Public"
                      : commentObj.is_public == 0
                        ? "Private"
                        : ""
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
