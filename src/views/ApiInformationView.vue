<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">G2P API</h2>
    <p>
      The G2P API available at
      <a
        href="https://www.ebi.ac.uk/gene2phenotype/api/"
        target="_blank"
        style="text-decoration: none"
        >https://www.ebi.ac.uk/gene2phenotype/api/</a
      >
      enables access to gene disease models held in the G2P database.
    </p>
    <p>
      G2P models for monogenic gene-disease relationships are manually curated
      from the peer-reviewed scientific literature and defined as structured
      collections of unique Locus-Genotype-Mechanism-Disease-Evidence (LGMDE)
      threads.
    </p>
    <div class="mt-3 d-flex justify-content-center">
      <figure class="figure">
        <img
          src="../assets/LGMDE-info.png"
          class="figure-img img-thumbnail border-secondary-subtle"
          alt="LGMDE diagram"
          width="800"
          height="auto"
        />
      </figure>
    </div>
    <p>
      See
      <a
        href="/gene2phenotype/about/terminology"
        target="_blank"
        style="text-decoration: none"
        >the terminology documentation</a
      >
      for descriptions of terminology used.
    </p>
    <p>3 levels of data are currently returned:</p>
    <ul>
      <li>Counts by panel</li>
      <li>Summaries of G2P records</li>
      <li>Full G2P records</li>
    </ul>
    <h4 class="pb-2">How to search records</h4>
    <p><b>Endpoint</b></p>
    <div class="citation-div">
      <p>
        https://www.ebi.ac.uk/gene2phenotype/api/search
      </p>
    </div>
    <p>
      The search endpoint matches on partial text while other endpoints look up
      data based on exact text matches.
    </p>
    <p><b>Parameters</b></p>
    <ul>
      <li>query (mandatory)</li>
      <li>type</li>
      <li>panel</li>
    </ul>
    <p><b>Examples</b></p>
    <ul>
      <li>Search by gene</li>
      <div class="citation-div">
        <p>
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=TP53&type=gene
        </p>
      </div>
      <li>Search by phenotype</li>
      <div class="citation-div">
        <p>
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=HP:0003416&type=phenotype
        </p>
      </div>
      <li>Generic search across all categories</li>
      <div class="citation-div">
        <p>
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=Weill-Marchesani syndrome
        </p>
      </div>
      <li>Search gene within a specific panel</li>
      <div class="citation-div">
        <p>
          https://www.ebi.ac.uk/gene2phenotype/api/search/?type=gene&query=FBN1&panel=DD
        </p>
      </div>
    </ul>
    <h4 class="pb-2">Fetch a specific record</h4>
    <p><b>Endpoint</b></p>
    <div class="citation-div">
      <p>
        https://www.ebi.ac.uk/gene2phenotype/api/lgd/<em>stable_id</em>
      </p>
    </div>
    <p>This endpoint returns detailed information about a specific record using the G2P stable ID.</p>
    <p><b>Example</b></p>
    <div class="citation-div">
      <p>
        https://www.ebi.ac.uk/gene2phenotype/api/lgd/G2P03507
      </p>
    </div>
    <h4 class="pb-2">Fetch counts by panel</h4>
    <p><b>Endpoint</b></p>
    <div class="citation-div">
      <p>
        https://www.ebi.ac.uk/gene2phenotype/api/panels
      </p>
    </div>
    <p>This endpoint returns summary counts for all G2P panels.</p>
    <p style="margin-top: 45px;">
      See
      <a
        href="https://www.ebi.ac.uk/gene2phenotype/api/"
        target="_blank"
        >https://www.ebi.ac.uk/gene2phenotype/api/</a
      >
      for full documentation.
    </p>
  </div>
</template>
<style scoped>
.citation-div {
  margin: 0;
}
.citation-div p {
  padding: 15px;
  background: #f4f4f4;
  border-radius: 5px;
  font-family: courier, monospace;
}
</style>