<script>
import GuidelinesModal from "./GuidelinesModal.vue";
export default {
  components: {
    GuidelinesModal,
  },
};
</script>
<template>
  <GuidelinesModal modal-id="record-guidelines-modal" title="Guidelines">
    <div class="p-3">
      <h4>When to create a new record if the gene is already in G2P</h4>
      <p>
        A G2P record is defined as a unique
        Locus-Genotype-Mechanism-Disease-Evidence (LGMDE) thread.
      </p>
      <p>
        If the gene you are curating is already in G2P, please review ALL
        existing G2P record(s) available for the gene of interest before
        creating a new G2P record.
      </p>
      <h5>Existing G2P records (Published records for Gene)</h5>
      <p>Key criteria to review in:</p>
      <ul>
        <li>
          <strong>Allelic requirement</strong>
          <ul>
            <li>
              Diseases that present both as monoallelic and biallelic (example
              <a
                href="https://www.ebi.ac.uk/gene2phenotype/search?query=FBN1"
                style="text-decoration: none"
                target="_blank"
                >FBN1-related Marfan syndrome</a
              >) are recorded as independent records, but using the same disease
              name, with 'monoallelic' or 'biallelic' added as in '<a
                href="https://www.ebi.ac.uk/gene2phenotype/disease/FBN1-related Marfan syndrome (monoallelic)"
                style="text-decoration: none"
                target="_blank"
                >FBN1-related Marfan syndrome (monoallelic)</a
              >' and '<a
                href="https://www.ebi.ac.uk/gene2phenotype/disease/FBN1-related Marfan syndrome (monoallelic)"
                style="text-decoration: none"
                target="_blank"
                >FBN1-related Marfan syndrome (biallelic)</a
              >'.
            </li>
            <li>
              Similar allelic requirements can result in distinct disease
              entities. In these cases, review types of causal <b>variants</b>,
              <b>molecular mechanisms</b>, and <b>phenotypic features</b> to
              confirm the uniqueness of the disorder. A restricted repertoire of
              variants (for example, a recurrent variant or variants in a
              specific protein domain) can result in different disorders for the
              same allelic requirement. See monoallelic
              <a
                href="https://www.ebi.ac.uk/gene2phenotype/search?query=FGFR3"
                style="text-decoration: none"
                target="_blank"
              >
                FGFR3 associations </a
              >.
            </li>
          </ul>
        </li>
        <li>
          <strong>Molecular mechanism</strong>. If known, check if the main
          molecular mechanism is the same or different. Available main
          mechanisms in G2P are: loss of function (LOF), gain of function (GOF),
          dominant negative (DN), and non-loss of function (non-LoF).
          <ul>
            <li>
              A LoF mechanism caused by NMD_triggering variants or gene
              deletions is more likely to result in the same disease.
            </li>
            <li>
              Similar mechanisms with specific categorisations (for example, LoF
              via loss of interaction versus LoF via loss of activity) can
              result in distinct disease entities. See
              <a
                href="https://www.ebi.ac.uk/gene2phenotype/search?query=INPP5E"
                style="text-decoration: none"
                target="_blank"
              >
                INPP5E </a
              >.
            </li>
            <li>
              A 'Molecular mechanism: Undetermined' annotation can be due to
              lack of evidence or that it has not been curated yet. Therefore,
              if the molecular mechanism in the existing G2P record(s) is
              Undetermined, assess if it could be the same or different from the
              one reported for the gene-association being curated.
            </li>
          </ul>
        </li>
        <li>
          <strong>Phenotypic features</strong>. Assess if the reported
          phenotypes are similar and/or vary in severity but can still be
          considered as part of a spectrum or variable phenotype for a unique
          disease entity. Or the phenotypes are distinct and distinguishable
          between the reported associations and can be considered separate
          unique disease entities.
        </li>
        <li>
          <strong>Disease name</strong>. Disease names can vary significantly
          across different resources/publications. Please, check known synonyms
          and alternative names. Please, pay special attention to G2P records
          with more generic disease names, like '<i
            >gene-related neurodevelopmental disorder</i
          >'. This is common when first describing a disorder. As additional
          evidence is published and the phenotypic features are better defined,
          these disease names will be updated to reflect that knowledge.
        </li>
      </ul>
      <p>
        Nosological authorities: OMIM, MONDO (Monarch Initiative), Orphanet, and
        GeneReviews. Please, contact the G2P team
        <a
          href="mailto:g2p-help@ebi.ac.uk"
          style="text-decoration: none"
          target="_blank"
          >g2p-help@ebi.ac.uk</a
        >
        if you are unsure about a new disease name or you want to update an
        existing one.
      </p>
      <p>
        If after reviewing these criteria, it is concluded the gene-disease
        association being curated matches an existing gene-disease G2P record,
        add the existing record to your panel. Once a G2P record has been added
        to your panel, you can update it. Please, for major updates (for
        example, Disease name, molecular mechanism and/or Confidence level)
        contact the members of the other panel(s) to inform or discuss the
        updates.
      </p>
      <h5>Existing G2P saved drafts (Saved drafts for Gene)</h5>
      <p>
        If there are one or more saved drafts from other G2P curators for the
        gene of interest, please contact the owner of the draft(s) using the
        email address provided in the <b>Action</b> column to confirm the
        gene-disease association you are curating is not under review by another
        G2P curator.
      </p>
      <p>
        Once you have confirmed the gene-disease association you are curating is
        not already in G2P as a published record or a curation draft, click on
        the <b>Create new record</b> to create a new curation template with an
        automatically populated <b>Gene information</b> section and all the
        curation fields to annotate the new gene-disease association.
      </p>
    </div>
  </GuidelinesModal>
  <GuidelinesModal
    modal-id="allelic-requirement-guidelines-modal"
    title="Guidelines"
  >
    <div class="py-3 px-5">
      <h4>Allelic requirement</h4>
      <p>
        Allelic requirement is unique for each G2P record. If the publication(s)
        provides evidence supporting more than one allelic requirement for the
        gene-disease association, create a new record to annotate each
        gene-disease association allelic requirement independently (e.g.
        monoallelic_autosomal for monoallelic variants and biallelic_autosomal
        for biallelic variants). This rule applies to both scenarios, when the
        phenotypes associated with the monoallelic and biallelic variants are
        considered a similar disease entity or a distinct disease entity.
      </p>
    </div>
  </GuidelinesModal>
  <GuidelinesModal modal-id="mechanism-guidelines-modal" title="Guidelines">
    <div class="py-3 px-5">
      <h4>Mechanism</h4>
      <p>
        Each record in the curation tool can only be annotated with one
        Mechanism. For disorders for which more than one mechanism has been
        described for the same allelic requirement, a G2P record has to be
        created for each reported mechanism.
      </p>
      <p>
        Mechanism can be annotated as Inferred (supporting data is based on
        computational or biological prediction, or the experimental evidence
        suggests but not demonstrates the mechanism) or as Evidence (supporting
        data is based on experimental biological functional studies and
        unequivocally demonstrates the mechanism).
      </p>
    </div>
  </GuidelinesModal>
  <GuidelinesModal
    modal-id="functional-studies-guidelines-modal"
    title="Guidelines"
  >
    <div class="py-3 px-5">
      <h4>Functional studies</h4>
      <p>
        To capture the experimental evidence supporting the annotated mechanism,
        use the Functional Studies section to record the type of evidence
        reported in each publication. For each publication in the curation
        record, one Functional Studies section will be displayed. The Functional
        Studies section can be used for any Mechanism annotation and for both
        evidence supported levels Inferred and Evidence.
      </p>
    </div>
  </GuidelinesModal>
  <GuidelinesModal modal-id="disease-name-guidelines-modal" title="Guidelines">
    <div class="p-3">
      <h4>Disease names style guide</h4>
      <ol>
        <li>
          Follow the dyadic naming system as 'HGNC GENE SYMBOL-related phenotype
          descriptor'. Examples:
          <ul>
            <li>
              AMOTL1-related orofacial clefting, cardiac anomalies, and tall
              stature
            </li>
            <li>PTPN11-related Noonan syndrome</li>
          </ul>
        </li>
        <li>
          Prioritise the use of phenotype terms compatible with HPO terms.
        </li>
        <li>
          Do not include allelic requirement. Exception, the same gene-disease
          association presents as mono- and biallelic forms, add '(monoallelic)'
          or ('biallelic') as appropriate (example: ALDH18A1-related spastic
          paraplegia (monoallelic) and ALDH18A1-related spastic paraplegia
          (biallelic)).
        </li>
        <li>
          Do not include the number/letter used to define genetic heterogeneity.
        </li>
        <li>
          Use lower case for everything except: Proper names (TRIM32-related
          Bardet-Biedl syndrome), Acronyms (FGFR3-related
          lacrimo-auriculo-dento-digital syndrome (LADD)), Chemical names
          (HADH-related 3-hydroxyacyl-CoA dehydrogenase deficiency).
        </li>
      </ol>
      <p>
        Please, contact the G2P team
        <a
          href="mailto:g2p-help@ebi.ac.uk"
          style="text-decoration: none"
          target="_blank"
          >g2p-help@ebi.ac.uk</a
        >
        if you are unsure about a new disease name.
      </p>
    </div>
  </GuidelinesModal>
</template>
