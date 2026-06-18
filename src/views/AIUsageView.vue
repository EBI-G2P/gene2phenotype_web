<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">Use of Artificial intelligence in Gene2Phenotype</h2>
    <p>
      G2P records are curated from the scientific literature and are
      <b>reviewed by clinical experts</b> before being published on the website.
      Artificial intelligence (AI) is used to accelerate some steps in the
      curation process.
    </p>
    <h4>Literature surveillance</h4>
    <p>
      A machine learning (ML) pipeline, utilising models which were fine-tuned
      to identify publications describing cases with rare developmental
      disorders, is used for literature surveillance. Details of the process and
      model fine-tuning are available in
      <a
        href="https://doi.org/10.1101/2025.11.24.25340871"
        target="_blank"
        style="text-decoration: none"
        >Yates et al 2025</a
      >.
    </p>
    <p>
      The pipeline maps publications to G2P records and they are displayed on
      the G2P website <b>before</b> they have been reviewed by curators. Where a
      record already has strong or definitive evidence to be used in clinical
      decision making, additional publications are unlikely to be assessed.
    </p>
    <p>
      Non-reviewed publications identified by the ML pipeline are displayed in a
      separate table from those which have been reviewed. This provides rapid,
      easy access to relevant literature when you are seeking information about
      monogenic disease with links to EuropePMC supporting quick assessment
      publications. If you see any results which should be removed, do
      <a
        href="/gene2phenotype/contact"
        target="_blank"
        style="text-decoration: none"
        >contact</a
      >
      us to let us know.
    </p>
    <div class="mt-3 d-flex justify-content-center">
      <figure class="figure" style="width: 800px">
        <img
          src="../assets/mined-publications-example.png"
          class="figure-img img-thumbnail border-secondary-subtle"
          alt="Mined publications example"
          width="800"
          height="auto"
        />
        <figcaption class="figure-caption">
          Table on G2P record page for G2P00745 showing publications which were
          identified by the ML pipeline and have not yet been reviewed by a
          curator. This table is blue to distinguish it from the table of
          curated papers which has a white background. Publications are ordered
          by date with the most recent at the top.
        </figcaption>
      </figure>
    </div>
    <h4>Literature prioritisation</h4>
    <p>
      Publications are ranked for curation using Google Gemini-based analysis
      which classifies their relevance to the gene-disease association. G2P
      records with limited evidence and publications classified as highly
      relevant are prioritised for review. This approach more rapidly identifies
      associations with sufficient evidence to be used in clinical reporting.
    </p>
    <h4>Data extraction</h4>
    <p>
      Sentences describing disease mechanism and supporting evidence are
      extracted from publications using Google Gemini and presented to curators
      in the G2P curation tool.
      <b
        >All information is assessed and summarised by curators before being
        made public on the G2P website.</b
      >
    </p>
  </div>
</template>
