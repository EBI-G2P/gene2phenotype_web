export const VariantTypesAttribs = [
  {
    primaryType: {
      labelText: "Protein changing",
      inputKey: "protein_changing",
    },
    secondaryType: [
      {
        displayNmdEscape: true,
        labelText: "frameshift_variant",
        inputKey: "frameshift_variant",
      },
      {
        displayNmdEscape: true,
        labelText: "stop_gained",
        inputKey: "stop_gained",
      },
      {
        displayNmdEscape: false,
        labelText: "missense_variant",
        inputKey: "missense_variant",
      },
      {
        displayNmdEscape: false,
        labelText: "inframe_insertion",
        inputKey: "inframe_insertion",
      },
      {
        displayNmdEscape: false,
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
        displayNmdEscape: false,
        labelText: "splice_region_variant",
        inputKey: "splice_region_variant",
      },
      {
        displayNmdEscape: true,
        labelText: "splice_acceptor_variant",
        inputKey: "splice_acceptor_variant",
      },
      {
        displayNmdEscape: true,
        labelText: "splice_donor_variant",
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
        displayNmdEscape: false,
        labelText: "5_prime_UTR_variant",
        inputKey: "5_prime_UTR_variant",
      },
      {
        displayNmdEscape: false,
        labelText: "3_prime_UTR_variant",
        inputKey: "3_prime_UTR_variant",
      },
      {
        displayNmdEscape: false,
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
        displayNmdEscape: false,
        labelText: "intergenic_variant",
        inputKey: "intergenic_variant",
      },
      {
        displayNmdEscape: false,
        labelText: "intron_variant",
        inputKey: "intron_variant",
      },
      {
        displayNmdEscape: false,
        labelText: "synonymous_variant",
        inputKey: "synonymous_variant",
      },
      {
        displayNmdEscape: false,
        labelText: "stop_lost",
        inputKey: "stop_lost",
      },
      {
        displayNmdEscape: false,
        labelText: "Whole/partial gene deletion",
        inputKey: "whole_partial_gene_deletion",
      },
      {
        displayNmdEscape: false,
        labelText: "Whole/partial gene duplication",
        inputKey: "whole_partial_gene_duplication",
      },
      {
        displayNmdEscape: false,
        labelText: "short_tandem_repeat_change",
        inputKey: "short_tandem_repeat_change",
      },
      {
        displayNmdEscape: false,
        labelText: "start_lost",
        inputKey: "start_lost",
      },
      {
        displayNmdEscape: false,
        labelText: "ncRNA",
        inputKey: "ncRNA",
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
  },
  {
    labelText: "Decreased_gene_product_level",
    inputKey: "decreased_gene_product_level",
    hierarchyLevel: 2,
    accession: "SO:0002316",
  },
  {
    labelText: "Absent_gene_product",
    inputKey: "absent_gene_product",
    hierarchyLevel: 3,
    accession: "SO:0002317",
  },
  {
    labelText: "Increased_gene_product_level",
    inputKey: "increased_gene_product_level",
    hierarchyLevel: 2,
    accession: "SO:0002315",
  },
  {
    labelText: "Altered_gene_product_structure",
    inputKey: "altered_gene_product_structure",
    hierarchyLevel: 1,
    accession: "SO:0002318",
  },
  {
    labelText: "Uncertain",
    inputKey: "uncertain",
    hierarchyLevel: 1,
    accession: null,
  },
];

export const EvidenceTypesAttribs = [
  {
    primaryType: "Function",
    secondaryType: ["Biochemical", "Protein Interaction", "Protein Expression"],
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
