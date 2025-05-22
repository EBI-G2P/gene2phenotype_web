<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">G2P API</h2>
    <p>
      The
      <a
        href="/gene2phenotype/api/"
        target="_blank"
        style="text-decoration: none"
        >G2P API</a
      >
      enables access to gene disease models held in the G2P database.
    </p>
    <p>
      G2P models for monogenic gene-disease relationships are manually curated
      from the peer-reviewed scientific literature and defined as structured
      collections of unique Locus-Genotype-Mechanism-Disease-Evidence (LGMDE)
      threads.
    </p>
    <div class="my-3 col-12 col-lg-8">
      <img
        alt="LGMDE diagram"
        src="../assets/LGMDE-info.png"
        width="100%"
        height="auto"
      />
    </div>
    <p>
      See
      <a
        href="/gene2phenotype/about/terminology"
        target="_blank"
        style="text-decoration: none"
        >the terminology docs</a
      >
      for descriptions of terminology used.
    </p>
    <p>3 levels of data are currently returned:</p>
    <ul>
      <li>Counts by panel</li>
      <li>Summaries of G2P records</li>
      <li>Full G2P records</li>
    </ul>
    <p>
      The search endpoint matches on partial text while other endpoints look up
      data based on exact text matches.
    </p>
    <p>
      See
      <a
        href="/gene2phenotype/api/"
        target="_blank"
        style="text-decoration: none"
        >G2P API</a
      >
      for full documentation.
    </p>
  </div>
</template>
