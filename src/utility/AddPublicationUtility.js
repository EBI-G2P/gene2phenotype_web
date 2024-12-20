import { VariantTypesAttribs, EvidenceTypesAttribs } from "./CurationConstants";
import cloneDeep from "lodash/cloneDeep";

export const getInitialInputForAddingNewPublicationData = (
  locusGeneDiseaseData
) => {
  const clonedLocusGeneDiseaseData = cloneDeep(locusGeneDiseaseData);
  const currentMechanism = clonedLocusGeneDiseaseData?.molecular_mechanism;
  let input = {
    publications: {},
    phenotypes: {},
    variant_types: {},
    variant_descriptions: {},
    molecular_mechanism: {
      name: currentMechanism?.mechanism ?? "", // if mechanism is null or undefined then it will set the value as empty string,
      support: currentMechanism?.mechanism_support ?? "", // if mechanism_support is null or undefined then it will set the value as empty string
    },
    mechanism_synopsis: {
      name: "",
      support: "",
    },
    mechanism_evidence: {},
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

export const updateHpoTermsInputHelperWithNewPublicationsData = (
  hpoTermsInputHelper,
  pmidList
) => {
  let updatedHpoTermsInputHelper = { ...hpoTermsInputHelper };
  pmidList.forEach((pmid) => {
    updatedHpoTermsInputHelper[pmid] = {
      isHpoTermsDataLoading: false,
      hpoTermsErrorMsg: "",
      isHpoTermsValid: true,
      hpoTermsInput: "",
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

export const prepareInputForNewPublicationDataSubmission = (
  input,
  locusGeneDiseaseData
) => {
  let clonedInput = cloneDeep(input);
  let preparedInput = {};

  // convert publications from object to array of objects and remove some keys and trim some key values
  let publicationsArray = [];
  for (const [pmidKey, valueObj] of Object.entries(clonedInput.publications)) {
    let publicationObj = {
      publication: { pmid: pmidKey },
      comment: { comment: valueObj.comment.trim(), is_public: 1 },
      families: {
        families: valueObj.families,
        consanguinity: valueObj.consanguineous,
        ancestries: valueObj.ancestries.trim(),
        affected_individuals: valueObj.affectedIndividuals,
      },
    };
    publicationsArray.push(publicationObj);
  }
  preparedInput.publications = publicationsArray;

  // convert phenotypes from object to array of objects and include phenotypes that have non empty hpo terms
  let phenotypesArray = [];
  for (const [pmidKey, valueObj] of Object.entries(clonedInput.phenotypes)) {
    if (valueObj.hpo_terms && valueObj.hpo_terms.length > 0) {
      let phenotypeObj = {
        pmid: pmidKey,
        summary: valueObj.summary.trim(), // trim summary value
        hpo_terms: valueObj.hpo_terms,
      };
      phenotypesArray.push(phenotypeObj);
    }
  }
  // IF phenotypesArray is not empty THEN include it in preparedInput object
  if (phenotypesArray.length > 0) {
    preparedInput.phenotypes = phenotypesArray;
  }

  // convert mechanism evidence from object to array of objects and include evidence that have non empty description or non empty evidence types
  let mechanismEvidenceArray = [];
  for (const [publicationPmid, valueObj] of Object.entries(
    clonedInput.mechanism_evidence
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
  // IF mechanismEvidenceArray is not empty THEN include it in preparedInput object
  if (mechanismEvidenceArray.length > 0) {
    preparedInput.mechanism_evidence = mechanismEvidenceArray;
  }

  // IF molecular_mechanism.name or molecular_mechanism.support is updated THEN include molecular_mechanism in preparedInput object
  if (
    isMechanismUpdated(locusGeneDiseaseData, clonedInput) ||
    isMechanismSupportUpdated(locusGeneDiseaseData, clonedInput)
  ) {
    preparedInput.molecular_mechanism = {
      name: isMechanismUpdated(locusGeneDiseaseData, clonedInput)
        ? clonedInput.molecular_mechanism.name
        : "",
      support: clonedInput.molecular_mechanism.support,
    };
  }

  // IF mechanism_synopsis is updated THEN include it in preparedInput object
  if (isMechanismSynopsisUpdated(clonedInput)) {
    preparedInput.mechanism_synopsis = clonedInput.mechanism_synopsis;
  }

  // convert variant types from object to array of objects and include variant types that have any non empty field data
  let variantTypesArray = [];
  for (const [primaryType, primaryTypeValueObj] of Object.entries(
    clonedInput.variant_types
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
  // IF variantTypesArray is not empty THEN include it in preparedInput object
  if (variantTypesArray.length > 0) {
    preparedInput.variant_types = variantTypesArray;
  }

  // convert variant descriptions from object to array of objects and include variant descriptions that have non empty description
  let variantDescriptionsArray = [];
  for (const [pmidKey, valueObj] of Object.entries(
    clonedInput.variant_descriptions
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
  // IF variantDescriptionsArray is not empty THEN include it in preparedInput object
  if (variantDescriptionsArray.length > 0) {
    preparedInput.variant_descriptions = variantDescriptionsArray;
  }

  return preparedInput;
};

const isMechanismUpdated = (locusGeneDiseaseData, clonedInput) => {
  const currentMechanism =
    locusGeneDiseaseData.molecular_mechanism.mechanism ?? ""; // if mechanism is null or undefined then it will set the value as empty string

  const newMechanism = clonedInput.molecular_mechanism.name;

  return newMechanism !== currentMechanism;
};

const isMechanismSupportUpdated = (locusGeneDiseaseData, clonedInput) => {
  const currentMechanismSupport =
    locusGeneDiseaseData.molecular_mechanism.mechanism_support ?? ""; // if mechanism_support is null or undefined then it will set the value as empty string

  const newMechanismSupport = clonedInput.molecular_mechanism.support;

  return newMechanismSupport !== currentMechanismSupport;
};

const isMechanismSynopsisUpdated = (clonedInput) => {
  const newSynopsis = clonedInput.mechanism_synopsis.name;
  const newSynopsisSupport = clonedInput.mechanism_synopsis.support;

  return newSynopsis !== "" || newSynopsisSupport !== "";
};
