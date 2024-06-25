<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">G2P Disclaimer</h2>
    <p>
      The gene2phenotype dataset (G2P) integrates data on genes, variants and
      phenotypes for human disorders. It is constructed entirely from published
      literature, and is primarily an inclusion list to allow targeted filtering
      of genome-wide data for diagnostic purposes. The dataset was compiled with
      respect to published genes, and annotated with types of disease-causing
      gene variants. Each record in the dataset associates a gene with a disease
      phenotype via an evidence level, inheritance mechanism and mutation
      consequence. Some genes therefore appear in the database more than once,
      where different genetic mechanisms result in different phenotypes.
    </p>
    <p>
      G2P curation is overseen by consultant clinical geneticists. The dataset
      is regularly updated as new publications provide additional evidence.
      Caution should therefore be exercised in its application.
    </p>
    <p>
      The data from G2P is freely available and interested parties can get in
      touch via g2p-help@ebi.ac.uk for further information. Please acknowledge
      gene2phenotype (<a
        href="http://www.ebi.ac.uk/gene2phenotype/"
        target="_blank"
        style="text-decoration: none"
        >http://www.ebi.ac.uk/gene2phenotype/</a
      >) if you use this list in your analyses or publications. For more
      information on G2P see our
      <router-link to="/publications" style="text-decoration: none"
        >publications page</router-link
      >.
    </p>
  </div>
</template>
