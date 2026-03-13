// API specific curation constants
export const VariantTypesAttribs = [
  {
    primaryType: {
      labelText: "Protein changing",
      inputKey: "protein_changing",
    },
    secondaryType: [
      {
        labelText: "frameshift_variant_NMD_escaping",
        inputKey: "frameshift_variant_NMD_escaping",
      },
      {
        labelText: "frameshift_variant_NMD_triggering",
        inputKey: "frameshift_variant_NMD_triggering",
      },
      {
        labelText: "frameshift_variant (unable to determine NMD status)",
        inputKey: "frameshift_variant",
      },
      {
        labelText: "stop_gained_NMD_escaping",
        inputKey: "stop_gained_NMD_escaping",
      },
      {
        labelText: "stop_gained_NMD_triggering",
        inputKey: "stop_gained_NMD_triggering",
      },
      {
        labelText: "stop_gained (unable to determine NMD status)",
        inputKey: "stop_gained",
      },
      {
        labelText: "missense_variant",
        inputKey: "missense_variant",
      },
      {
        labelText: "inframe_insertion",
        inputKey: "inframe_insertion",
      },
      {
        labelText: "inframe_deletion",
        inputKey: "inframe_deletion",
      },
    ],
  },
  {
    primaryType: {
      labelText: "Splice variants",
      inputKey: "splice_variants",
    },
    secondaryType: [
      {
        labelText: "splice_region_variant",
        inputKey: "splice_region_variant",
      },
      {
        labelText: "splice_acceptor_variant_NMD_escaping",
        inputKey: "splice_acceptor_variant_NMD_escaping",
      },
      {
        labelText: "splice_acceptor_variant_NMD_triggering",
        inputKey: "splice_acceptor_variant_NMD_triggering",
      },
      {
        labelText: "splice_acceptor_variant (unable to determine NMD status)",
        inputKey: "splice_acceptor_variant",
      },
      {
        labelText: "splice_donor_variant_NMD_escaping",
        inputKey: "splice_donor_variant_NMD_escaping",
      },
      {
        labelText: "splice_donor_variant_NMD_triggering",
        inputKey: "splice_donor_variant_NMD_triggering",
      },
      {
        labelText: "splice_donor_variant (unable to determine NMD status)",
        inputKey: "splice_donor_variant",
      },
    ],
  },
  {
    primaryType: {
      labelText: "Regulatory variants",
      inputKey: "regulatory_variants",
    },
    secondaryType: [
      {
        labelText: "5_prime_UTR_variant",
        inputKey: "5_prime_UTR_variant",
      },
      {
        labelText: "3_prime_UTR_variant",
        inputKey: "3_prime_UTR_variant",
      },
      {
        labelText: "regulatory_region_variant",
        inputKey: "regulatory_region_variant",
      },
    ],
  },
  {
    primaryType: {
      labelText: "Other variants",
      inputKey: "other_variants",
    },
    secondaryType: [
      {
        labelText: "intergenic_variant",
        inputKey: "intergenic_variant",
      },
      {
        labelText: "intron_variant",
        inputKey: "intron_variant",
      },
      {
        labelText: "synonymous_variant",
        inputKey: "synonymous_variant",
      },
      {
        labelText: "stop_lost",
        inputKey: "stop_lost",
      },
      {
        labelText: "Whole/partial gene deletion",
        inputKey: "whole_partial_gene_deletion",
      },
      {
        labelText: "Whole/partial gene duplication",
        inputKey: "whole_partial_gene_duplication",
      },
      {
        labelText: "short_tandem_repeat_change",
        inputKey: "short_tandem_repeat_change",
      },
      {
        labelText: "start_lost",
        inputKey: "start_lost",
      },
      {
        labelText: "non_coding_transcript_variant",
        inputKey: "non_coding_transcript_variant",
      },
    ],
  },
];

export const VariantConsequencesAttribs = [
  {
    labelText: "Altered_gene_product_level",
    inputKey: "altered_gene_product_level",
    hierarchyLevel: 1,
    accession: "SO:0002314",
    description:
      "A sequence variant that alters the level or amount of gene product produced. This high-level term can be applied where the direction of level change (increased vs decreased gene product level) is unknown or not confirmed, e.g., promoter or enhancer variants, some splice variants.",
  },
  {
    labelText: "Decreased_gene_product_level",
    inputKey: "decreased_gene_product_level",
    hierarchyLevel: 2,
    accession: "SO:0002316",
    description:
      "A sequence variant that decreases the level or amount of gene product produced, e.g., a 5′ UTR variant that reduced protein levels by disrupting translation, a 3′ UTR variant that affects RNA stability, splice variants that decrease but do not stop expression, variants leading to nonsense-mediated-decay (NMD)-competent premature termination codon (PTCs), or gene-disrupting structural variants.",
  },
  {
    labelText: "Absent_gene_product",
    inputKey: "absent_gene_product",
    hierarchyLevel: 3,
    accession: "SO:0002317",
    description:
      "A sequence variant that results in no gene product. e.g., whole gene or other large scale disruptive structural variant, variants producing NMD-competent PTCs.",
  },
  {
    labelText: "Increased_gene_product_level",
    inputKey: "increased_gene_product_level",
    hierarchyLevel: 2,
    accession: "SO:0002315",
    description:
      "A variant that increases the level or amount of gene product produced, e.g., non-disruptive gene duplications, some promoter or enhancer variants.",
  },
  {
    labelText: "Altered_gene_product_structure",
    inputKey: "altered_gene_product_structure",
    hierarchyLevel: 1,
    accession: "SO:0002318",
    description:
      "A sequence variant that alters the sequence of a gene product. e.g., missense variants, NMD-incompetent PTCs, and other length-changing variants (in-frame indels, stop loss).",
  },
  {
    labelText: "Uncertain",
    inputKey: "uncertain",
    hierarchyLevel: 1,
    accession: null,
    description: null,
  },
];

export const EvidenceTypesAttribs = [
  {
    primaryType: "Function",
    secondaryType: [
      "Biochemical",
      "Protein Interaction",
      "Protein Expression",
      "In Silico Modelling",
    ],
  },
  {
    primaryType: "Functional Alteration",
    secondaryType: ["Patient Cells", "Non Patient Cells"],
  },
  {
    primaryType: "Models",
    secondaryType: ["Non-Human Model Organism", "Cell Culture Model"],
  },
  {
    primaryType: "Rescue",
    secondaryType: [
      "Non-Human Model Organism",
      "Cell Culture Model",
      "Patient Cells",
    ],
  },
];

export const MechanismAttribs = [
  "dominant negative",
  "gain of function",
  "loss of function",
  "undetermined",
  "undetermined non-loss-of-function",
];

export const MechanismSynopsisAttribs = [
  "competitive dominant-negative",
  "assembly-mediated dominant negative",
  "assembly-mediated GOF",
  "other GOF",
  "local LOF leading to overall GOF",
  "loss of activity LOF",
  "LOF due to protein mislocalisation",
  "interaction-disrupting LOF",
  "destabilising LOF",
  "aggregation",
];

export const MechanismSupportAttribs = ["inferred", "evidence"];

export const ConfidenceAttribsOrder = [
  "definitive",
  "strong",
  "moderate",
  "limited",
  "disputed",
  "refuted",
];

// Website specific curation constants
export const CURATION_WARNINGS = {
  CONFIDENCE_WARNING:
    "A record should only be given 'definitive' confidence status if it has been upheld over time - this usually means at least 4 publications over 5 years.",
  ALTERED_GENE_PRODUCT_LEVEL_WARNING:
    "'Altered_gene_product_level' is selected without a matching variant type of 'splice_donor_variant', 'splice_donor_variant_NMD_triggering', 'start_lost', 'frameshift_variant', 'frameshift_variant_NMD_triggering', 'stop_gained' or 'stop_gained_NMD_triggering'",
  DECREASED_GENE_PRODUCT_LEVEL_WARNING:
    "'Decreased_gene_product_level' is selected without a matching variant type of 'splice_acceptor_variant', 'splice_acceptor_variant_NMD_triggering', 'splice_donor_variant', 'splice_donor_variant_NMD_triggering', 'start_lost', 'frameshift_variant', 'frameshift_variant_NMD_triggering', 'stop_gained' or 'stop_gained_NMD_triggering'",
  ABSENT_GENE_PRODUCT_WARNING:
    "'Absent_gene_product' is selected without a matching variant type of 'splice_donor_variant', 'splice_donor_variant_NMD_triggering', 'start_lost', 'frameshift_variant', 'frameshift_variant_NMD_triggering', 'stop_gained' or 'stop_gained_NMD_triggering'",
  ALTERED_GENE_PRODUCT_STRUCTURE_WARNING:
    "'Altered_gene_product_structure' is selected without a matching variant type of 'stop_lost', 'missense_variant', 'inframe_insertion', 'inframe_deletion', 'frameshift_variant_NMD_escaping', 'stop_gained_NMD_escaping', 'splice_acceptor_variant_NMD_escaping' or 'splice_donor_variant_NMD_escaping'",
};
