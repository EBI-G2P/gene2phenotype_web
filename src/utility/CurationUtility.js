import {
  VariantTypesAttribs,
  VariantConsequencesAttribs,
  EvidenceTypesAttribs,
} from "./CurationConstants";
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
    mechanism_synopsis: {
      name: "",
      support: "",
    },
    mechanism_evidence: {},
    disease: { disease_name: "", cross_references: [] },
    panels: [],
    confidence: {
      justification: "",
      level: "",
    },
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

  return input;
};

export const updateInputWithPublicationsData = (input, publicationsData) => {
  let updatedInput = { ...input };

  // update publications, phenotypes, variant_descriptions, mechanism_evidence fields of input
  let updatedPublicationsObj = {};
  let updatedPhenotypesObj = {};
  let updatedVariantDescriptionsObj = {};
  let updatedMechanismEvidenceObj = {};

  publicationsData.results.forEach((item) => {
    updatedPublicationsObj[item.pmid] = {
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

    updatedPhenotypesObj[item.pmid] = {
      summary: "",
      hpo_terms: [],
    };

    updatedVariantDescriptionsObj[item.pmid] = {
      description: "",
    };

    let evidenceTypesObj = {};
    EvidenceTypesAttribs.forEach((item) => {
      evidenceTypesObj[item.primaryType] = [];
    });
    updatedMechanismEvidenceObj[item.pmid] = {
      description: "",
      evidence_types: evidenceTypesObj,
    };
  });

  updatedInput.publications = updatedPublicationsObj;
  updatedInput.phenotypes = updatedPhenotypesObj;
  updatedInput.variant_descriptions = updatedVariantDescriptionsObj;
  updatedInput.mechanism_evidence = updatedMechanismEvidenceObj;

  for (let primaryTypeKey in updatedInput.variant_types) {
    for (let secondaryTypeKey in updatedInput.variant_types[primaryTypeKey]) {
      updatedInput.variant_types[primaryTypeKey][
        secondaryTypeKey
      ].supporting_papers = [];
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

export const updateHpoTermsInputHelperWithPublicationsData = (pmidList) => {
  let hpoTermsInputHelper = {};
  pmidList.forEach((pmid) => {
    hpoTermsInputHelper[pmid] = {
      isHpoTermsDataLoading: false,
      hpoTermsErrorMsg: "",
      isHpoTermsValid: true,
      hpoTermsInput: "",
    };
  });
  return hpoTermsInputHelper;
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

  // convert phenotypes from object to array of objects and include phenotypes that have non empty hpo terms
  let phenotypesArray = [];
  for (const [pmidKey, valueObj] of Object.entries(preparedInput.phenotypes)) {
    if (valueObj.hpo_terms && valueObj.hpo_terms.length > 0) {
      let phenotypeObj = {
        pmid: pmidKey,
        summary: valueObj.summary.trim(), // trim summary value
        hpo_terms: valueObj.hpo_terms,
      };
      phenotypesArray.push(phenotypeObj);
    }
  }
  preparedInput.phenotypes = phenotypesArray;

  // convert mechanism evidence from object to array of objects and include evidence that have non empty description or non empty evidence types
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
    if (valueObj.description.trim() !== "" || evidenceTypesArray.length > 0) {
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
        pmid: pmidKey,
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

  // trim disease name
  preparedInput.disease.disease_name =
    preparedInput.disease.disease_name.trim();

  // if disease name is not empty then prefix locus to disease name and disease name does not contain gene-related
  const regex = new RegExp(`${preparedInput.locus}-related`, "i");
  if (
    preparedInput.disease.disease_name !== "" &&
    !regex.test(preparedInput.disease.disease_name)
  ) {
    preparedInput.disease.disease_name = `${preparedInput.locus}-related ${preparedInput.disease.disease_name}`;
  }

  // trim session name
  preparedInput.session_name = preparedInput.session_name.trim();

  // trim confidence justification
  preparedInput.confidence.justification =
    preparedInput.confidence.justification.trim();

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
    const { description, pmid } = variant;

    if (variantDescObj[pmid]) {
      variantDescObj[pmid] = {
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

  let MechanismSynopsisObj = {
    name: clonedpreviousInput.mechanism_synopsis.name,
    support: clonedpreviousInput.mechanism_synopsis.support,
  };

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
  //cleaning the disease name
  let prefix_to_remove = clonedpreviousInput.locus + "-related";
  let disease_name = clonedpreviousInput.disease.disease_name.replace(
    prefix_to_remove,
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
    mechanism_synopsis: MechanismSynopsisObj,
    mechanism_evidence: MechanismEvidenceObj,
    disease: {
      disease_name: disease_name,
      cross_references: clonedpreviousInput.disease.cross_references,
    },
    panels: clonedpreviousInput.panels,
    confidence: {
      justification: clonedpreviousInput.confidence.justification,
      level: clonedpreviousInput.confidence.level,
    },
  };
};
