<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-3">Responsible Handover - G2P Data</h2>
    <p>
      This page summarises information required to support the responsible
      adoption and use of Gene2Phenotype (G2P) data, following the principles
      described in the Sense About Science
      <strong>Responsible Handover</strong>{{ " " }}
      <a
        href="https://senseaboutscience.org/responsible-handover-of-ai/"
        target="_blank"
        style="text-decoration: none"
        >implementation guide</a
      >.
    </p>
    <p>
      If you are planning to use G2P data, we recommend you read through this
      page to understand any requirements, assumptions and limitations and
      ensure appropriate, informed use.
    </p>
    <h4 class="pb-2">Purpose</h4>
    <h5>What is G2P?</h5>
    <p>
      Gene2Phenotype (G2P) is a curated resource which provides evidence-based
      gene-disease associations curated from the published scientific
      literature. Structured G2P records describe disease mechanisms, allelic
      requirements and the confidence supporting each association.
    </p>
    <h5>What problem does G2P solve?</h5>
    <p>
      G2P was developed to improve the efficiency and consistency of diagnostic
      variant prioritisation by providing expert-curated gene-disease
      relationships that can be incorporated into genomic analysis pipelines.
    </p>
    <h5>Appropriate use</h5>
    <p>
      G2P is intended to support expert interpretation of genomic variants in
      clinical and research settings. It should be used with accurate
      phenotyping, other sources of evidence and clinical judgement rather than
      as a standalone decision-making tool.
    </p>
    <p>
      If G2P is used outside this intended context, you should consider whether
      additional limitations or risks may apply.
    </p>
    <h4 class="pb-2">Scope and capabilities</h4>
    <h5>What information does G2P provide?</h5>
    <p>
      Each G2P record contains structured gene-disease association information
      describing:
    </p>
    <ul>
      <li>disease mechanism</li>
      <li>allelic requirement</li>
      <li>variant consequence</li>
      <li>confidence in the evidence</li>
      <li>supporting scientific publications</li>
    </ul>
    <p>
      This information is intended to support variant filtering and
      interpretation in genomic medicine.
    </p>
    <h5>Comparison with other resources</h5>
    <p>
      G2P focuses on expert-reviewed evidence and structured descriptions of
      disease mechanisms and provides more detailed mechanistic information than
      many comparable resources.
    </p>
    <p>
      Due to the requirement for manual curation and clinical expert review, G2P
      is <strong>not comprehensive</strong> across all disease domains.
      Summaries of gene-disease association validity across other disease
      domains can be obtained from other resources such as the Gene Curation
      Coalition (GenCC) database, which aggregates results from many major
      curation efforts.
    </p>
    <h5>Application of FAIR principles</h5>
    <p>G2P data is FAIR.</p>
    <ul>
      <li>
        The G2P website search functions ensure <strong>findability</strong>.
      </li>
      <li>
        The website and well documented API have been designed to be
        <strong>accessible</strong>.
      </li>
      <li>
        To be <strong>interoperable</strong>, HGNC gene ids and symbols are used
        to describe genes; G2P disease information is mapped to ontology terms,
        where possible and we collaborate within GenCC to agree common
        terminology standards, including terms for the classification of gene
        disease association validity.
      </li>
      <li>
        The use of standardised formats and clear description of evidence used
        enables <strong>reusability</strong>.
      </li>
    </ul>
    <h4 class="pb-2">Data sources</h4>
    <h5>Where does the information come from?</h5>
    <p>
      G2P is developed from peer-reviewed scientific publications describing
      monogenic disease. Each curated record includes references to the
      publications used during curation.
    </p>
    <h5>Can the supporting evidence be accessed?</h5>
    <p>
      Yes. Links to the scientific publications supporting each record are
      provided wherever possible.
    </p>
    <h4 class="pb-2">Data quality and limitations</h4>
    <h5>Potential sources of bias</h5>
    <p>
      The available evidence reflects published studies and therefore
      predominantly represents patients who have access to genomic healthcare or
      participate in research studies. Like all literature-derived resources,
      G2P data may therefore under-represent some populations and conditions.
    </p>
    <h5>Coverage</h5>
    <p>
      G2P is <strong>not intended to be a comprehensive catalogue</strong> of
      all gene-disease relationships currently.
    </p>
    <p>
      Expert review is required before new evidence is incorporated into the
      database, meaning there is an unavoidable delay between publication of new
      findings and their inclusion in G2P.
    </p>
    <p>
      The current limitations are described in the
      <a
        href="/gene2phenotype/disclaimer"
        target="_blank"
        style="text-decoration: none"
        >G2P Disclaimer</a
      >.
    </p>
    <h4 class="pb-2">Assumptions and appropriate use</h4>
    <p>
      G2P data can be used in a range of research and tool development settings.
      Special considerations are required when using it in clinical diagnostic
      settings.
    </p>
    <h5>Requirements for effective use in diagnostic variant filtering</h5>
    <p>
      G2P is designed to <strong>support expert users</strong> and successful
      use requires:
    </p>
    <ul>
      <li>accurate patient phenotyping</li>
      <li>appropriate genomic variant calling</li>
      <li>expert clinical interpretation</li>
      <li>consideration of additional sources of evidence</li>
    </ul>
    <p>
      G2P should not be interpreted as providing definitive clinical diagnoses.
    </p>
    <h4 class="pb-2">Performance and maintenance</h4>
    <h5>How is G2P maintained?</h5>
    <p>G2P records are created and reviewed by expert curators.</p>
    <p>
      Large scale checks for consistency with other data (e.g. mechanism
      predictions, variant population frequency resources, other curation
      resources) are performed as data becomes available. Regular literature
      surveillance is in place to identify new reports providing more evidence
      for, or contradicting G2P records.
    </p>
    <p>
      Feedback from users is captured through a Request Tracker system, allowing
      requests for review or correction to be prioritised.
    </p>
    <h5>Updates</h5>
    <p>
      G2P data are updated at least twice each month, and changes are visible on
      the website straight away.
    </p>
    <p>
      Monthly data snapshots are archived and made available via the EMBL-EBI
      FTP site to support reproducibility. Also, individual records can be
      downloaded in PDF to enable local archiving of the information available
      at the time a decision was made.
    </p>
    <h5>Documentation and support</h5>
    <p>
      Documentation describing G2P, its data model and usage is available on the
      G2P website.
    </p>
    <p>
      Contact details for questions, feedback and requests for record review are
      also provided on the website.
    </p>
    <h4 class="pb-2">Risks and mitigations</h4>
    <h5>Known limitations</h5>
    <p>Users should be aware that:</p>
    <ul>
      <li>
        G2P does not contain gene-disease associations for all disease domains.
      </li>
      <li>
        Newly published evidence for genes related to G2P focus areas may not
        yet have been curated.
      </li>
    </ul>
    <h5>Risk mitigation</h5>
    <p>Users are encouraged to:</p>
    <ul>
      <li>use the latest available release</li>
      <li>combine G2P with complementary resources</li>
      <li>review the supporting literature where relevant</li>
      <li>apply expert clinical judgement throughout variant interpretation</li>
    </ul>
    <p>
      Further information is provided in the
      <a
        href="/gene2phenotype/disclaimer"
        target="_blank"
        style="text-decoration: none"
        >G2P Disclaimer</a
      >.
    </p>
    <h4 class="pb-2">Legal and ethical considerations</h4>
    <p>
      G2P is derived entirely from publicly available scientific literature. It
      does not contain private patient data.
    </p>
    <p>
      The resource is intended to support responsible genomic interpretation and
      should be used in accordance with applicable local guidelines and
      regulatory/clinical governance requirements.
    </p>
    <h4 class="pb-2">Licensing</h4>
    <h5>Software</h5>
    <p>
      The G2P software is released under the
      <strong>Apache 2.0</strong> licence.
    </p>
    <h5>Data</h5>
    <p>
      The G2P dataset is released under the
      <strong>Creative Commons Attribution 4.0 (CC BY 4.0)</strong> licence. If
      publishing work using G2P data, we request that you cite the latest G2P
      publication.
    </p>
    <h4 class="pb-2">Responsible use</h4>
    <p>
      G2P is intended to support—not replace—expert interpretation of genomic
      data.
    </p>
    <p>Users should ensure that:</p>
    <ul>
      <li>the resource is appropriate for their intended use</li>
      <li>its known limitations are understood</li>
      <li>complementary evidence sources are considered</li>
      <li>results are interpreted by suitably qualified professionals</li>
    </ul>
    <p>
      Local copies of G2P data incorporated into analysis pipelines should be
      updated regularly to ensure the resource reflects current knowledge as
      closely as possible.
    </p>
  </div>
</template>
