<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">G2P Disclaimer</h2>
    <p>
      The gene2phenotype database (G2P) contains expert curated gene-disease
      information. It is created from gene-disease specific publications and
      <b>may not be a comprehensive record for any specific gene or disease</b>.
      G2P curation is overseen by consultant clinical geneticists. The dataset
      is regularly updated as new publications provide additional evidence.
      Please <b>exercise caution in its application</b>, observe the 'Last
      updated' dates on records and notify us of any incomplete or out of date
      information. We welcome feedback from the community and alerts about new
      publications referring to a gene or condition which would improve our
      records, via
      <a
        href="mailto:g2p-help@ebi.ac.uk"
        class="text-decoration-none"
        target="_blank"
        rel="noopener noreferrer"
        >g2p-help@ebi.ac.uk</a
      >.
    </p>
    <p>
      G2P is constructed entirely from published literature and was initially
      designed as an inclusion list to allow targeted filtering of genome-wide
      data for diagnostic purposes. The dataset was compiled with respect to
      published gene-disease associations and annotated with types of
      disease-causing gene variants. Each record in the dataset associates a
      gene with a disease phenotype via an evidence level, inheritance mechanism
      and mutation consequence. Some genes therefore appear in the database more
      than once, where different genetic mechanisms result in different
      phenotypes. A subset of G2P entries include more detailed phenotypic
      features and mechanism information; the number of records with this level
      of detail will increase over time.
    </p>
    <p>
      The data from G2P is freely available and shared in good faith. Interested
      parties can get in touch via
      <a
        href="mailto:g2p-help@ebi.ac.uk"
        class="text-decoration-none"
        target="_blank"
        rel="noopener noreferrer"
        >g2p-help@ebi.ac.uk</a
      >
      for further information. Please acknowledge gene2phenotype (<a
        href="https://www.ebi.ac.uk/gene2phenotype/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-decoration-none"
        >https://www.ebi.ac.uk/gene2phenotype/</a
      >) if you use these data in your analyses or publications. For more
      information on G2P see our
      <router-link to="/publications" class="text-decoration-none"
        >publications page</router-link
      >.
    </p>
  </div>
</template>
