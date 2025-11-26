export const CONFIDENCE_COLOR_MAP = {
  definitive: "#276749",
  strong: "#38a169",
  moderate: "#68d391",
  limited: "#fc8181",
  disputed: "#e53e3e",
  refuted: "#9b2c2c",
};

export const MAX_CHARACTERS = 800;

export const HELP_TEXT = {
  ALLELIC_REQUIREMENT:
    "Required genotype. G2P uses synonyms of the HPO mode of inheritance terminology, as many of the disorders described are de novo.",
  VARIANT_CONSEQUENCE:
    "The consequence of the reported variants on the protein (for protein-coding genes) or the RNA (for non-protein coding genes), per allele.",
  VARIANT_TYPE:
    "The types of variants associated with the curated gene-disease pair reported in the publication",
  MECHANISM:
    "The molecular mechanisms underlying gene-disease association  Derived from Badonyi & Marsh.",
  CONFIDENCE: "Confidence the association is real, based on available evidence",
  CROSS_CUTTING_MODIFIER:
    "Additional information reported in the publication that is relevant to the gene-disease inheritance",
  CATEGORISATION:
    "More detailed synopsis of molecular mechanism, where available",
  PHENOTYPIC_FEATURE: "Phenotypic features reported in the publication",
  G2P_ID: "The unique stable identifier for this record in G2P",
  EXTERNAL_LINKS: "Information for this gene in other resources",
  CROSS_REFERENCES: "Ontology/ OMIM terms related to this disease record",
  MARSH_PROBABILITY:
    "These scores were calculated using a tripartite statistical model based on diverse gene and protein level features that are known to discriminate between molecular mechanisms. It is made up of machine classifiers trained to predict whether human protein coding genes are likely to be associated with dominant-negative, gain-of-function, or loss-of-function molecular disease mechanisms In many cases, the different dominant molecular mechanisms are not mutually exclusive in a gene.",
  GAIN_OF_FUNCTION:
    "Badonyi and Marsh pGOF: The probability that the protein is associated with a gain-of-function disease mechanism (pGOF). Gain-of-function mechanisms are characterized by an altered or newly appeared function in the mutant protein. Genes with higher scores are more likely to be associated with a gain of function disease mechanism. The recommended threshold for pGOF is 0.63.",
  LOSS_OF_FUNCTION:
    "Badonyi and Marsh pLOF: the probability that the protein is associated with a loss-of-function disease mechanism (pLOF). A loss-of-function mechanism is characterised by complete ablation of the function of the proteinGenes with higher scores are more likely to be associated with a loss of function disease mechanism. The recommended threshold for pLOF is 0.64.",
  DOMINANT_NEGATIVE:
    "Badonyi and Marsh pDN: the probability that the protein is associated with a dominant-negative disease mechanism (pDN). Dominant-negative mechanisms are characterized by the mutant protein directly or indirectly disrupting the function of the wild type protein. Genes with higher scores are more likely to be associated with a dominant-negative disease mechanism. The recommended threshold for pDN is 0.61.",
  LGMDE_RECORD:
    "G2P records are Locus-Genotype-Mechanism-Disease-Evidence (LGMDE) threads describing gene-disease associations",
  DOWNLOAD_ALL_DATA:
    "Download all records for this panel, including all attributes, not just those displayed here.",
  CHANGE_MECHANISM:
    "To change Mechanism, please contact Admin at g2p-help@ebi.ac.uk",
  CLICK_HPO_SUGGESTION: "Click any term to select it.",
  GENE_LOCATION:
    "The location of the gene on the GRCh38 reference assembly. The format is chromosome:start:end:strand where '1' is forward strand and '-1' is reverse strand.",
  MINED_PUBLICATIONS:
    "These publications have been mined from PubMed (Publication: 'Domain-wide Mapping of Peer-reviewed Literature for Genetic Developmental Disorders using Machine Learning and Gene2Phenotype', doi: 10.1101/2025.11.24.25340871) and have not yet been reviewed. Where more than 100 novel publications were identified, only the most recent 100 are displayed. All publications are available on the FTP site.",
};

export const MARSH_PROBABILITY_THRESHOLD = {
  LOSS_OF_FUNCTION: 0.64,
  GAIN_OF_FUNCTION: 0.63,
  DOMINANT_NEGATIVE: 0.61,
};

export const NOT_AVAILABLE = "Not Available";
export const NOT_ASSIGNED = "Not Assigned";
export const NO_CURATED_PUBLICATIONS_AVAILABLE =
  "No curated publications available";

export const MINED_PUBLICATION_STATUS = {
  MINED: "mined",
  CURATED: "curated",
  REJECTED: "rejected",
};

export const PRIVACY_POLICY_CONFIG = {
  STORAGE_KEY_NAME: "gene2phenotype.privacy-policy.version",
  VERSION: "1.0.0",
  PRIVACY_POLICY_URL:
    "https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/privacy_notices/",
  TERMS_OF_USE_URL: "https://www.ebi.ac.uk/about/terms-of-use/#general",
};
