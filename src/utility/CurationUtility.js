import {
  VariantTypesAttribs,
  VariantConsequencesAttribs,
  EvidenceTypesAttribs,
  MechanismSynopsisAttribs,
  CURATION_WARNINGS,
} from "./CurationConstants.js";
import cloneDeep from "lodash/cloneDeep";

export const getInitialInputForNewCuration = () => {
  let input = {
    locus: "",
    session_name: "",
    publications: {},
    phenotypes: {},
    allelic_requirement: "",
    cross_cutting_modifier: [],
    variant_types: {},
    variant_descriptions: {},
    variant_consequences: {},
    molecular_mechanism: {
      name: "",
      support: "",
    },
    mechanism_synopsis: {},
    mechanism_evidence: {},
    disease: { disease_name: "", cross_references: [] },
    panels: [],
    confidence: "",
    public_comment: "",
    private_comment: "",
  };

  // initialize variant_types field of input with VariantTypesAttribs
  let variantTypesObj = {};
  for (const item of VariantTypesAttribs) {
    variantTypesObj[item.primaryType.inputKey] = {};
    for (const secondaryTypeObj of item.secondaryType) {
      variantTypesObj[item.primaryType.inputKey][secondaryTypeObj.inputKey] = {
        nmd_escape: false,
        de_novo: false,
        inherited: false,
        unknown_inheritance: false,
        supporting_papers: [],
        comment: "",
      };
    }
  }
  input.variant_types = variantTypesObj;

  // initialize variant_consequences field of input with VariantConsequencesAttribs
  let variantConsequencesObj = {};
  VariantConsequencesAttribs.forEach((item) => {
    variantConsequencesObj[item.inputKey] = "";
  });
  input.variant_consequences = variantConsequencesObj;

  // initialize mechanism_synopsis field of input with MechanismSynopsisAttribs
  let mechanismSynopsisObj = {};
  MechanismSynopsisAttribs.forEach((item) => {
    mechanismSynopsisObj[item] = "";
  });
  input.mechanism_synopsis = mechanismSynopsisObj;

  return input;
};

export const updateInputWithNewPublicationsData = (input, publicationsData) => {
  let updatedInput = { ...input };

  // update publications, phenotypes, variant_descriptions, mechanism_evidence fields of input
  publicationsData.results.forEach((item) => {
    updatedInput.publications[item.pmid] = {
      families: null,
      affectedIndividuals: null,
      consanguineous: "unknown",
      ancestries: "",
      comment: "",
      source: item.source,
      year: item.year,
      title: item.title,
      authors: item.authors,
    };

    updatedInput.phenotypes[item.pmid] = {
      summary: "",
      hpo_terms: [],
    };

    updatedInput.variant_descriptions[item.pmid] = {
      description: "",
    };

    let evidenceTypesObj = {};
    EvidenceTypesAttribs.forEach((item) => {
      evidenceTypesObj[item.primaryType] = [];
    });
    updatedInput.mechanism_evidence[item.pmid] = {
      description: "",
      evidence_types: evidenceTypesObj,
    };
  });

  return updatedInput;
};

export const updateInputWithRemovedPublications = (input, removedPmidList) => {
  let updatedInput = { ...input };

  removedPmidList.forEach((pmid) => {
    // remove pmid from publications, phenotypes, variant_descriptions, mechanism_evidence fields of input
    delete updatedInput.publications[pmid];
    delete updatedInput.phenotypes[pmid];
    delete updatedInput.variant_descriptions[pmid];
    delete updatedInput.mechanism_evidence[pmid];
  });

  // remove pmid from supporting papers list of variant_types
  for (let primaryTypeKey in updatedInput.variant_types) {
    for (let secondaryTypeKey in updatedInput.variant_types[primaryTypeKey]) {
      const supportingPapers =
        updatedInput.variant_types[primaryTypeKey][secondaryTypeKey]
          .supporting_papers;
      // filter supporting papers by removing pmids
      const filteredSupportingPapers = supportingPapers.filter(
        (supportingPaper) => !removedPmidList.includes(supportingPaper)
      );
      updatedInput.variant_types[primaryTypeKey][
        secondaryTypeKey
      ].supporting_papers = filteredSupportingPapers;
    }
  }

  return updatedInput;
};

const convertVariantConsequencesArrayToObject = (variantConsequencesArray) => {
  let variantConsequenceObj = {};

  VariantConsequencesAttribs.forEach((item) => {
    variantConsequenceObj[item.inputKey] = "";
  });

  variantConsequencesArray.forEach((variantConsequence) => {
    const { variant_consequence, support } = variantConsequence;

    variantConsequenceObj[variant_consequence] = support;
  });

  return variantConsequenceObj;
};

const convertMechanismSynopsisArrayToObject = (
  mechanismSynopsisPreviousInput
) => {
  // convert mechanism synopsis from array of objects to object
  let mechanismSynopsisObj = {};

  let mechanismSynopsisPreviousInputArray = [];
  /* 
  New format for mechanism_synopsis is:
  [
    {
      "name": "...",
      "support": "..."
    },
    .
    .
  ]
  Old format for mechanism_synopsis is:
  {
    "name": "...",
    "support": "..."
  }
  
  The below code logic makes sure that saved drafts storing the old format of mechanism_synopsis are processed correctly.
  Below 3 scenarios are addressed:
  1. If clonedpreviousInput.mechanism_synopsis follows new format then retain the value in mechanismSynopsisPreviousInputArray
  2. If clonedpreviousInput.mechanism_synopsis follows old format with non empty value in 'name' field as follows:
  {
    "name": "<non empty value>",
    "support": "..."
  }
  then convert it to below format for mechanismSynopsisPreviousInputArray:
  [
    {
      "name": "<non empty value>",
      "support": "..."
    }
  ]
  3. If clonedpreviousInput.mechanism_synopsis follows old format with empty value in 'name' field then it is ignored
  */
  if (Array.isArray(mechanismSynopsisPreviousInput)) {
    mechanismSynopsisPreviousInputArray = mechanismSynopsisPreviousInput;
  } else if (
    typeof mechanismSynopsisPreviousInput === "object" &&
    mechanismSynopsisPreviousInput !== null &&
    "name" in mechanismSynopsisPreviousInput &&
    "support" in mechanismSynopsisPreviousInput &&
    mechanismSynopsisPreviousInput.name !== ""
  ) {
    mechanismSynopsisPreviousInputArray.push(mechanismSynopsisPreviousInput);
  }

  MechanismSynopsisAttribs.forEach((item) => {
    mechanismSynopsisObj[item] = "";
  });

  mechanismSynopsisPreviousInputArray.forEach((item) => {
    const { name, support } = item;

    mechanismSynopsisObj[name] = support;
  });

  return mechanismSynopsisObj;
};

export const updateHpoTermsInputHelperWithNewPublicationsData = (
  hpoTermsInputHelper,
  pmidList
) => {
  let updatedHpoTermsInputHelper = { ...hpoTermsInputHelper };
  pmidList.forEach((pmid) => {
    updatedHpoTermsInputHelper[pmid] = {
      isLoadingValue: false,
      HPOsearchResponseJson: [],
      HPOAPIerrormsg: null,
      searchTerm: "",
    };
  });
  return updatedHpoTermsInputHelper;
};

export const updateHpoTermsInputHelperWithRemovedPublications = (
  hpoTermsInputHelper,
  removedPmidList
) => {
  let updatedHpoTermsInputHelper = { ...hpoTermsInputHelper };
  removedPmidList.forEach((pmid) => {
    delete updatedHpoTermsInputHelper[pmid];
  });
  return updatedHpoTermsInputHelper;
};

export const prepareInputForDataSubmission = (input) => {
  let preparedInput = cloneDeep(input);

  // convert publications from object to array of objects and remove some keys and trim some key values
  let publicationsArray = [];
  for (const [pmidKey, valueObj] of Object.entries(
    preparedInput.publications
  )) {
    let publicationObj = { pmid: pmidKey };
    const keysToTrimValues = ["ancestries", "comment"];
    for (const [key, value] of Object.entries(valueObj)) {
      if (keysToTrimValues.includes(key)) {
        publicationObj[key] = value.trim();
      } else {
        publicationObj[key] = value;
      }
    }
    publicationsArray.push(publicationObj);
  }
  preparedInput.publications = publicationsArray;

  // convert phenotypes from object to array of objects and include phenotypes that have non empty hpo terms or non empty phenotype summary
  let phenotypesArray = [];
  for (const [pmidKey, valueObj] of Object.entries(preparedInput.phenotypes)) {
    if (valueObj.hpo_terms?.length > 0 || valueObj.summary.trim() !== "") {
      let phenotypeObj = {
        pmid: pmidKey,
        summary: valueObj.summary.trim(), // trim summary value
        hpo_terms: valueObj.hpo_terms,
      };
      phenotypesArray.push(phenotypeObj);
    }
  }
  preparedInput.phenotypes = phenotypesArray;

  // if molecular_mechanism.name is 'undetermined' and molecular_mechanism.support is blank then set molecular_mechanism.support to 'inferred'
  if (
    preparedInput.molecular_mechanism.name === "undetermined" &&
    preparedInput.molecular_mechanism.support === ""
  ) {
    preparedInput.molecular_mechanism.support = "inferred";
  }

  // convert mechanism evidence from object to array of objects and include evidence that have non empty evidence types
  let mechanismEvidenceArray = [];
  for (const [publicationPmid, valueObj] of Object.entries(
    preparedInput.mechanism_evidence
  )) {
    let evidenceTypesArray = [];
    for (const [primaryType, secondaryTypesArray] of Object.entries(
      valueObj.evidence_types
    )) {
      if (secondaryTypesArray.length > 0) {
        let evidenceTypeObj = {
          primary_type: primaryType,
          secondary_type: secondaryTypesArray,
        };
        evidenceTypesArray.push(evidenceTypeObj);
      }
    }
    // IF evidenceTypesArray is not empty THEN include it in mechanismEvidenceArray
    if (evidenceTypesArray.length > 0) {
      let mechanismEvidenceObj = {
        pmid: publicationPmid,
        description: valueObj.description.trim(), // trim description value
        evidence_types: evidenceTypesArray,
      };
      mechanismEvidenceArray.push(mechanismEvidenceObj);
    }
  }
  preparedInput.mechanism_evidence = mechanismEvidenceArray;

  // convert variant types from object to array of objects and include variant types that have any non empty field data
  let variantTypesArray = [];
  for (const [primaryType, primaryTypeValueObj] of Object.entries(
    preparedInput.variant_types
  )) {
    for (const [secondaryType, secondaryTypeValueObj] of Object.entries(
      primaryTypeValueObj
    )) {
      if (
        secondaryTypeValueObj.de_novo ||
        secondaryTypeValueObj.inherited ||
        secondaryTypeValueObj.nmd_escape ||
        secondaryTypeValueObj.unknown_inheritance ||
        secondaryTypeValueObj.comment.trim() !== "" ||
        secondaryTypeValueObj.supporting_papers.length > 0
      ) {
        let variantTypesObj = {
          ...secondaryTypeValueObj,
          primary_type: primaryType,
          secondary_type: secondaryType,
          comment: secondaryTypeValueObj.comment.trim(), // trim comment value
        };
        variantTypesArray.push(variantTypesObj);
      }
    }
  }
  preparedInput.variant_types = variantTypesArray;

  // convert variant descriptions from object to array of objects and include variant descriptions that have non empty description
  let variantDescriptionsArray = [];
  for (const [pmidKey, valueObj] of Object.entries(
    preparedInput.variant_descriptions
  )) {
    if (valueObj.description.trim() !== "") {
      let variantDescriptionObj = {
        ...valueObj,
        publication: pmidKey,
        description: valueObj.description.trim(), // trim description value
      };
      variantDescriptionsArray.push(variantDescriptionObj);
    }
  }
  preparedInput.variant_descriptions = variantDescriptionsArray;

  // convert variant consequences from object to array of objects and include variant consequence that have non empty support
  let variantConsequencesArray = [];
  for (const [key, value] of Object.entries(
    preparedInput.variant_consequences
  )) {
    if (value !== "") {
      let variantConsequencesObj = {
        variant_consequence: key,
        support: value,
      };
      variantConsequencesArray.push(variantConsequencesObj);
    }
  }
  preparedInput.variant_consequences = variantConsequencesArray;

  // convert mechanism synopsis from object to array of objects and include mechanism synopsis that have non empty support
  let mechanismSynopsisArray = [];
  for (const [key, value] of Object.entries(preparedInput.mechanism_synopsis)) {
    if (value !== "") {
      let mechanismSynopsisObj = {
        name: key,
        support: value,
      };
      mechanismSynopsisArray.push(mechanismSynopsisObj);
    }
  }
  preparedInput.mechanism_synopsis = mechanismSynopsisArray;

  // trim disease name
  preparedInput.disease.disease_name =
    preparedInput.disease.disease_name.trim();

  // if disease name is not empty and disease name does not contain gene-related then prefix locus to disease name
  const regex = new RegExp(`${preparedInput.locus}-related`, "i");
  if (
    preparedInput.disease.disease_name !== "" &&
    !regex.test(preparedInput.disease.disease_name)
  ) {
    preparedInput.disease.disease_name = `${preparedInput.locus}-related ${preparedInput.disease.disease_name}`;
  }

  // trim session name
  preparedInput.session_name = preparedInput.session_name.trim();

  // trim public comment text
  preparedInput.public_comment = preparedInput.public_comment.trim();

  // trim private comment text
  preparedInput.private_comment = preparedInput.private_comment.trim();

  return preparedInput;
};

export const prepareInputForUpdating = (previousInput) => {
  //preparing the input to be used to clean
  let clonedpreviousInput = cloneDeep(previousInput);

  //publicationsObj needs to be empty because the publication array needs to be deconstructed to become Object of keys
  let publicationsObj = {};
  let publications = clonedpreviousInput.publications;

  publications.forEach((publication) => {
    const {
      families,
      affectedIndividuals,
      consanguineous,
      ancestries,
      comment,
      source,
      year,
      title,
      authors,
      pmid,
    } = publication;
    publicationsObj[pmid] = {
      families,
      affectedIndividuals,
      consanguineous,
      ancestries,
      comment,
      source,
      year,
      title,
      authors,
      pmid,
    };
  });

  //deconstructing the phenotype array to be an Object of keys using the publicationObj keys
  let phenotypesObj = {};
  let phenotypes = clonedpreviousInput.phenotypes;

  for (const key of Object.keys(publicationsObj)) {
    phenotypesObj[key] = {
      summary: "",
      hpo_terms: [],
    };
  }

  phenotypes.forEach((phenotype) => {
    const { pmid, summary, hpo_terms } = phenotype;

    if (phenotypesObj[pmid]) {
      phenotypesObj[pmid] = {
        summary,
        hpo_terms,
      };
    }
  });

  let variantDescObj = {};
  let variantDesc = clonedpreviousInput.variant_descriptions;

  for (const key of Object.keys(publicationsObj)) {
    variantDescObj[key] = {
      description: "",
    };
  }

  variantDesc.forEach((variant) => {
    const { description, publication } = variant;

    if (variantDescObj[publication]) {
      variantDescObj[publication] = {
        description,
      };
    }
  });

  let variantTypesObj = {};
  let variantTypes = clonedpreviousInput.variant_types;
  for (const item of VariantTypesAttribs) {
    variantTypesObj[item.primaryType.inputKey] = {};
    for (const secondaryTypeObj of item.secondaryType) {
      variantTypesObj[item.primaryType.inputKey][secondaryTypeObj.inputKey] = {
        nmd_escape: false,
        de_novo: false,
        inherited: false,
        unknown_inheritance: false,
        supporting_papers: [],
        comment: "",
      };
    }
  }

  variantTypes.forEach((variantType) => {
    const {
      comment,
      de_novo,
      inherited,
      nmd_escape,
      primary_type,
      secondary_type,
      supporting_papers,
      unknown_inheritance,
    } = variantType;

    // Ensure the primary_type key exists
    if (variantTypesObj[primary_type][secondary_type]) {
      variantTypesObj[primary_type][secondary_type] = {
        comment,
        de_novo,
        inherited,
        nmd_escape,
        supporting_papers,
        unknown_inheritance,
      };
    }
  });

  let MechanismNameObj = {
    name: clonedpreviousInput.molecular_mechanism.name,
    support: clonedpreviousInput.molecular_mechanism.support,
  };

  // if MechanismNameObj.name is 'undetermined' and MechanismNameObj.support is 'inferred' then set MechanismNameObj.support to blank
  if (
    MechanismNameObj.name === "undetermined" &&
    MechanismNameObj.support === "inferred"
  ) {
    MechanismNameObj.support = "";
  }

  let MechanismEvidenceObj = {};
  let MechanismEvidence = clonedpreviousInput.mechanism_evidence;

  for (const key of Object.keys(publicationsObj)) {
    MechanismEvidenceObj[key] = {
      description: "",
      evidence_types: {},
    };
  }

  // Populate the evidence_types for each key
  for (const key of Object.keys(MechanismEvidenceObj)) {
    for (const item of EvidenceTypesAttribs) {
      if (!MechanismEvidenceObj[key].evidence_types[item.primaryType]) {
        MechanismEvidenceObj[key].evidence_types[item.primaryType] = [];
      }
    }
  }

  if (MechanismEvidence) {
    MechanismEvidence.forEach((evidence) => {
      const { pmid, description, evidence_types } = evidence;

      if (MechanismEvidenceObj[pmid]) {
        MechanismEvidenceObj[pmid].description = description;
        //evidence_types is an array so need to loop through it and
        //check for MechanismEvidenceObj has the property and then assign the secondary type
        evidence_types.forEach((types) => {
          const { primary_type, secondary_type } = types;
          if (
            MechanismEvidenceObj[pmid].evidence_types.hasOwnProperty(
              primary_type
            )
          ) {
            MechanismEvidenceObj[pmid].evidence_types[primary_type] =
              secondary_type;
          }
        });
      }
    });
  }

  // Remove locus prefix from disease name
  let prefixToRemove = `${clonedpreviousInput.locus}-related `;
  let diseaseName = clonedpreviousInput.disease.disease_name.replace(
    prefixToRemove,
    ""
  );

  return {
    locus: clonedpreviousInput.locus,
    publications: publicationsObj,
    phenotypes: phenotypesObj,
    allelic_requirement: clonedpreviousInput.allelic_requirement,
    cross_cutting_modifier: clonedpreviousInput.cross_cutting_modifier,
    session_name: clonedpreviousInput.session_name,
    variant_types: variantTypesObj,
    variant_descriptions: variantDescObj,
    variant_consequences: convertVariantConsequencesArrayToObject(
      clonedpreviousInput.variant_consequences
    ),
    molecular_mechanism: MechanismNameObj,
    mechanism_synopsis: convertMechanismSynopsisArrayToObject(
      clonedpreviousInput.mechanism_synopsis
    ),
    mechanism_evidence: MechanismEvidenceObj,
    disease: {
      disease_name: diseaseName,
      cross_references: clonedpreviousInput.disease.cross_references,
    },
    panels: clonedpreviousInput.panels,
    confidence: clonedpreviousInput.confidence,
    public_comment: clonedpreviousInput.public_comment,
    private_comment: clonedpreviousInput.private_comment,
  };
};

export const getFamiliesInputErrorMsg = (families, affectedIndividuals) => {
  if (affectedIndividuals && families > affectedIndividuals) {
    return "No. of families can not be greater than affected individuals";
  }
  if (!families && affectedIndividuals) {
    return "No. of families can not be empty or zero";
  }
  return null;
};

export const getAffectedIndividualsInputErrorMsg = (
  families,
  affectedIndividuals
) => {
  if (families && !affectedIndividuals) {
    return "Affected individuals can not be empty or zero";
  }
  return null;
};

export const getVariantConsequenceCssClass = (hierarchyLevel) => {
  if (hierarchyLevel === 1) {
    return "text-start";
  } else if (hierarchyLevel === 2) {
    return "text-center";
  } else if (hierarchyLevel === 3) {
    return "text-end";
  }
  return "text-start";
};

export const checkRecordWarnings = (
  confidence,
  publications,
  variant_consequences,
  variant_types
) => {
  let recordWarnings = [];
  // IF "definitive" confidence is selected THEN there should be atleast 4 publications over 5 years time
  if (confidence === "definitive") {
    const currentYear = new Date().getFullYear();
    let filteredCount = Object.values(publications).filter(
      (item) => currentYear - item.year >= 5
    ).length;
    if (filteredCount < 4) {
      recordWarnings.push(CURATION_WARNINGS["CONFIDENCE_WARNING"]);
    }
  }
  // IF "altered_gene_product_level" variant consequence is selected
  // THEN atleast one of the below variant types should be selected:
  // "frameshift_variant", "stop_gained", "splice_donor_variant", "start_lost"
  if (variant_consequences["altered_gene_product_level"] !== "") {
    if (
      !isVariantTypeSelected(
        variant_types["protein_changing"]["frameshift_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["protein_changing"]["stop_gained"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["splice_variants"]["splice_donor_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["other_variants"]["start_lost"],
        false
      )
    ) {
      recordWarnings.push(
        CURATION_WARNINGS["ALTERED_GENE_PRODUCT_LEVEL_WARNING"]
      );
    }
  }
  // IF "decreased_gene_product_level" variant consequence is selected
  // THEN atleast one of the below variant types should be selected:
  // "frameshift_variant", "stop_gained", "splice_donor_variant", "splice_acceptor_variant", "start_lost"
  if (variant_consequences["decreased_gene_product_level"] !== "") {
    if (
      !isVariantTypeSelected(
        variant_types["protein_changing"]["frameshift_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["protein_changing"]["stop_gained"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["splice_variants"]["splice_donor_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["splice_variants"]["splice_acceptor_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["other_variants"]["start_lost"],
        false
      )
    ) {
      recordWarnings.push(
        CURATION_WARNINGS["DECREASED_GENE_PRODUCT_LEVEL_WARNING"]
      );
    }
  }
  // IF "absent_gene_product" variant consequence is selected
  // THEN atleast one of the below variant types should be selected:
  // "frameshift_variant", "stop_gained"(with NMD), "splice_donor_variant", "start_lost"
  if (variant_consequences["absent_gene_product"] !== "") {
    if (
      !isVariantTypeSelected(
        variant_types["protein_changing"]["frameshift_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["protein_changing"]["stop_gained"],
        true
      ) &&
      !isVariantTypeSelected(
        variant_types["splice_variants"]["splice_donor_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["other_variants"]["start_lost"],
        false
      )
    ) {
      recordWarnings.push(CURATION_WARNINGS["ABSENT_GENE_PRODUCT_WARNING"]);
    }
  }
  // IF "altered_gene_product_structure" variant consequence is selected
  // THEN atleast one of the below variant types should be selected:
  // "missense_variant", "inframe_insertion", "inframe_deletion", "stop_lost"
  if (variant_consequences["altered_gene_product_structure"] !== "") {
    if (
      !isVariantTypeSelected(
        variant_types["protein_changing"]["missense_variant"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["protein_changing"]["inframe_insertion"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["protein_changing"]["inframe_deletion"],
        false
      ) &&
      !isVariantTypeSelected(
        variant_types["other_variants"]["stop_lost"],
        false
      )
    ) {
      recordWarnings.push(
        CURATION_WARNINGS["ALTERED_GENE_PRODUCT_STRUCTURE_WARNING"]
      );
    }
  }
  return recordWarnings;
};

const isVariantTypeSelected = (variantTypeObj, isNmdEscape) => {
  return (
    variantTypeObj.nmd_escape === isNmdEscape &&
    (variantTypeObj.de_novo ||
      variantTypeObj.inherited ||
      variantTypeObj.unknown_inheritance ||
      variantTypeObj.comment.trim() !== "" ||
      variantTypeObj.supporting_papers.length > 0)
  );
};
