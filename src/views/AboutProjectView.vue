<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">The G2P Project</h2>
    <p>
      The G2P project, hosted at EMBL-EBI, shares detailed, evidence-based
      gene-disease models, curated from the literature by experts. These data
      can be used in the G2P extension of the Ensembl Variant Effect Predictor
      (Ensembl VEP) to efficiently filter genotype data from the exome or genome
      wide sequencing of people with genetic disorders to identify likely
      causative variants and accelerate diagnosis.
    </p>
    <p>
      The G2P project was established by David FitzPatrick in 2012 with the aim
      of accelerating the diagnosis of children with developmental disorders. In
      2014, the database moved from the University of Edinburgh to EMBL-EBI and
      a dedicated website was launched to improve data accessibility. G2P has
      been generalised to cover other disease areas and extended to capture
      additional information to provide a more detailed understanding of disease
      mechanism.
    </p>
    <p>
      All data is made freely available. The initial paper is available
      <a
        href="https://doi.org/10.1038/s41467-019-10016-3"
        target="_blank"
        style="text-decoration: none"
        >here</a
      >.
    </p>
    <p>For each evidence-based gene-disease model, we report:</p>
    <ul>
      <li>Allelic requirement to enable more precise matching on genotype</li>
      <li>
        Variant molecular consequence to enable efficient variant filtering
      </li>
      <li>Mutation mechanism, with evidence</li>
      <li>
        Confidence, based on the strength of evidence available in the
        literature
      </li>
      <li>
        Additional information to aid clinical interpretation including when a
        genotype is only seen de novo and observations of reduced penetrance,
        mosaicism
      </li>
      <li>
        The publications used in assessment, so the original evidence can be
        reviewed
      </li>
    </ul>
    <p>
      The full curation process is described here and terminology used is
      described
      <a
        href="https://genomemedicine.biomedcentral.com/articles/10.1186/s13073-024-01398-1"
        target="_blank"
        style="text-decoration: none"
        >here</a
      >.
    </p>
    <p>
      The Ensembl VEP diagnostic variant filtering pipeline matches patient
      genotypes to allelic requirements and genes reported in the literature to
      identify likely causative genes and variants. Full information is
      available
      <router-link to="/variant-filtering" style="text-decoration: none"
        >here</router-link
      >.
    </p>
    <p>
      G2P is a member of the Gene Curation Coalition (<a
        href="https://thegencc.org/"
        target="_blank"
        style="text-decoration: none"
        >GenCC</a
      >) which seeks to standardise the curation and description of gene disease
      information.
    </p>
  </div>
</template>
