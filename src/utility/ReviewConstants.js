export const REVIEW_STATUS = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
};

export const REVIEW_STATUS_OPTIONS = [
  REVIEW_STATUS.OPEN,
  REVIEW_STATUS.UNDER_REVIEW,
  REVIEW_STATUS.RESOLVED,
];

export const REVIEW_COMPONENT_OPTIONS = [
  { value: "disease", label: "Disease" },
  { value: "disease_cross_reference", label: "Disease cross reference" },
  { value: "mechanism", label: "Molecular mechanism" },
  { value: "genotype", label: "Allelic requirement" },
  { value: "confidence", label: "Confidence" },
  { value: "publications", label: "Publications" },
  { value: "mined_publications", label: "Mined publications" },
  { value: "phenotypes", label: "Phenotypes" },
  { value: "variant_type", label: "Variant type" },
  { value: "variant_consequence", label: "Variant consequence" },
  { value: "panel", label: "Panel" },
  { value: "duplicate", label: "Duplicate" },
  { value: "full_review", label: "Full review" },
  { value: "other", label: "Other" },
];
