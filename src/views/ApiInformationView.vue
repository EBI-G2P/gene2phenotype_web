<script>
import CodeBlock from "../components/code-block/CodeBlock.vue";
export default {
  components: {
    CodeBlock,
  },
};
</script>
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
    <p>
      See
      <a
        href="https://www.ebi.ac.uk/gene2phenotype/api/"
        target="_blank"
        style="text-decoration: none"
      >
        https://www.ebi.ac.uk/gene2phenotype/api/
      </a>
      for full documentation.
    </p>
    <h4 class="pb-2">How to search records</h4>
    <h6>Endpoint</h6>
    <CodeBlock class="mb-3">
      https://www.ebi.ac.uk/gene2phenotype/api/search
    </CodeBlock>
    <p>
      The search endpoint matches on partial text while other endpoints look up
      data based on exact text matches.
    </p>
    <h6>Parameters</h6>
    <ul>
      <li>query (mandatory)</li>
      <li>
        type (optional): specifies the type of your search. If omitted, the
        endpoint performs a generic search across all types.
      </li>
      <li>panel (optional): filters results to a specific panel by name.</li>
    </ul>
    <h6>Examples</h6>
    <ul>
      <li>
        Generic search by gene
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=TP53
        </CodeBlock>
      </li>
      <li>
        Search by gene
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=TP53&type=gene
        </CodeBlock>
      </li>
      <li>
        Generic search by phenotype
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=HP:0003416
        </CodeBlock>
      </li>
      <li>
        Search by phenotype
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=HP:0003416&type=phenotype
        </CodeBlock>
      </li>
      <li>
        Generic search by disease
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?query=Weill-Marchesani
          syndrome
        </CodeBlock>
      </li>
      <li>
        Search gene within a specific panel
        <CodeBlock class="mb-3">
          https://www.ebi.ac.uk/gene2phenotype/api/search/?type=gene&query=FBN1&panel=DD
        </CodeBlock>
      </li>
    </ul>
    <h4 class="py-2">How to fetch a specific record</h4>
    <h6>Endpoint</h6>
    <CodeBlock class="mb-3">
      https://www.ebi.ac.uk/gene2phenotype/api/lgd/{stable_id}
    </CodeBlock>
    <p>
      This endpoint returns detailed information about a specific record using
      the G2P stable ID.
    </p>
    <h6>Example</h6>
    <CodeBlock class="mb-3">
      https://www.ebi.ac.uk/gene2phenotype/api/lgd/G2P03507
    </CodeBlock>
    <h4 class="py-2">How to fetch counts for all panels</h4>
    <h6>Endpoint</h6>
    <CodeBlock class="mb-3">
      https://www.ebi.ac.uk/gene2phenotype/api/panels
    </CodeBlock>
    <p>This endpoint returns summary counts for all G2P panels.</p>
  </div>
</template>
