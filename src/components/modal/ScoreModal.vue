<template>
  <div
    class="modal fade"
    id="score-modal"
    tabindex="-1"
    aria-labelledby="score-modal-label"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="score-modal-label">Relevance scores</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row p-3">
            <table class="table table-hover table-bordered shadow-sm">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>high</td>
                  <td>
                    The article directly supports an association between the
                    gene and the disease.
                  </td>
                </tr>
                <tr>
                  <td>medium</td>
                  <td>
                    The article discusses the gene or disease in a
                    mechanistically relevant context, but without demonstrating
                    a direct association between the two.
                  </td>
                </tr>
                <tr>
                  <td>low</td>
                  <td>
                    The article discusses the gene or disease in an unrelated
                    context or links the gene to a different disease.
                  </td>
                </tr>
                <tr>
                  <td>disputed</td>
                  <td>
                    The article provides evidence that contradicts or disproves
                    an association between the gene and the disease.
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="p-0 mb-0">
              <b>Note</b>: Scores are calculated using
              <a
                href="https://github.com/EBI-G2P/gene2phenotype_scripts/blob/main/publication_analysis/gemini_publication_analyser.py"
                style="text-decoration: none"
                target="_blank"
              >
                this Gemini script
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
