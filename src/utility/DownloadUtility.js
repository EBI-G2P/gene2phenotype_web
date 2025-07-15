import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CONFIDENCE_COLOR_MAP } from "./Constants.js";

// Set the fonts
pdfMake.addVirtualFileSystem(pdfFonts);

const NOT_AVAILABLE = "Not Available";
const NOT_ASSIGNED = "Not Assigned";

const prepareVariantTypesObj = (locusGeneDiseaseData, isAuthenticated) => {
  if (locusGeneDiseaseData.variant_type?.length > 0) {
    // Prepare table header row
    const variantTypesTableHeaders = [
      "Type",
      "Inheritance",
      "Publications",
      isAuthenticated && "Comments",
    ].filter(Boolean);
    const variantTypesTableHeaderRow = variantTypesTableHeaders.map((item) => {
      return { text: item, style: "tableHeader" };
    });
    // Prepare table body rows
    let variantTypesTableBodyRows = [];
    if (isAuthenticated) {
      variantTypesTableBodyRows = locusGeneDiseaseData.variant_type.map(
        (item) => {
          return [
            item.accession
              ? {
                  text: item.term,
                  link: `http://www.sequenceontology.org/browser/current_release/term/${item.accession}`,
                  style: "link",
                }
              : item.term,
            item.de_novo || item.inherited || item.unknown_inheritance
              ? {
                  ul: [
                    item.de_novo && "De Novo",
                    item.inherited && "Inherited",
                    item.unknown_inheritance && "Unknown Inheritance",
                  ],
                }
              : "",
            item.publications?.length > 0
              ? {
                  ul: item.publications.map((publicationItem) => {
                    return {
                      text: publicationItem,
                      link: `https://europepmc.org/article/MED/${publicationItem}`,
                      style: "link",
                    };
                  }),
                }
              : "",
            item.comments?.length > 0
              ? {
                  ul: item.comments.map(
                    (commentItem) =>
                      commentItem.text + " (" + commentItem.date + ")"
                  ),
                }
              : "",
          ];
        }
      );
    } else {
      variantTypesTableBodyRows = locusGeneDiseaseData.variant_type.map(
        (item) => {
          return [
            item.accession
              ? {
                  text: item.term,
                  link: `http://www.sequenceontology.org/browser/current_release/term/${item.accession}`,
                  style: "link",
                }
              : item.term,
            item.de_novo || item.inherited || item.unknown_inheritance
              ? {
                  ul: [
                    item.de_novo && "De Novo",
                    item.inherited && "Inherited",
                    item.unknown_inheritance && "Unknown Inheritance",
                  ],
                }
              : "",
            item.publications?.length > 0
              ? {
                  ul: item.publications.map((publicationItem) => {
                    return {
                      text: publicationItem,
                      link: `https://europepmc.org/article/MED/${publicationItem}`,
                      style: "link",
                    };
                  }),
                }
              : "",
          ];
        }
      );
    }
    // Prepare table rows (header and body rows)
    const variantTypesTableRows = [
      variantTypesTableHeaderRow,
      ...variantTypesTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: variantTypesTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const prepareVariantDescriptionObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.variant_description?.length > 0) {
    // Prepare table header row
    const variantDescriptionHeaders = ["Variant Description", "Publications"];
    const variantDescriptionTableHeaderRow = variantDescriptionHeaders.map(
      (item) => {
        return { text: item, style: "tableHeader" };
      }
    );
    // Prepare table body rows
    const variantDescriptionTableBodyRows =
      locusGeneDiseaseData.variant_description.map((item) => [
        item.description,
        item.publications?.length > 0
          ? {
              ul: item.publications.map((publicationItem) => {
                return {
                  text: publicationItem,
                  link: `https://europepmc.org/article/MED/${publicationItem}`,
                  style: "link",
                };
              }),
            }
          : "",
      ]);
    // Prepare table rows (header and body rows)
    const variantDescriptionTableRows = [
      variantDescriptionTableHeaderRow,
      ...variantDescriptionTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: variantDescriptionTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const prepareVariantConsequencesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.variant_consequence?.length > 0) {
    // Prepare table header row
    const variantConsequencesHeaders = ["Variant Consequence", "Support"];
    const variantConsequencesTableHeaderRow = variantConsequencesHeaders.map(
      (item) => {
        return { text: item, style: "tableHeader" };
      }
    );
    // Prepare table body rows
    const variantConsequencesTableBodyRows =
      locusGeneDiseaseData.variant_consequence.map((item) => [
        item.accession
          ? {
              text: item.variant_consequence,
              link: `http://www.sequenceontology.org/browser/current_release/term/${item.accession}`,
              style: "link",
            }
          : item.variant_consequence,
        item.support,
      ]);
    // Prepare table rows (header and body rows)
    const variantConsequencesTableRows = [
      variantConsequencesTableHeaderRow,
      ...variantConsequencesTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: variantConsequencesTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const prepareMechanismCategorisationObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.molecular_mechanism?.synopsis?.length > 0) {
    // Prepare table header row
    const mechanismCategorisationHeaders = ["Categorisation", "Support"];
    const mechanismCategorisationTableHeaderRow =
      mechanismCategorisationHeaders.map((item) => {
        return { text: item, style: "tableHeader" };
      });
    // Prepare table body rows
    const mechanismCategorisationTableBodyRows =
      locusGeneDiseaseData.molecular_mechanism.synopsis.map((item) => [
        item.synopsis,
        item.support,
      ]);
    // Prepare table rows (header and body rows)
    const mechanismCategorisationTableRows = [
      mechanismCategorisationTableHeaderRow,
      ...mechanismCategorisationTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: mechanismCategorisationTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const getMechanismEvidenceTypes = (obj) => {
  let mechanismEvidenceTypes = [];
  for (const [
    primaryEvidenceType,
    secondaryEvidenceTypeArray,
  ] of Object.entries(obj)) {
    mechanismEvidenceTypes.push(
      `${primaryEvidenceType} : ${
        secondaryEvidenceTypeArray?.length > 0
          ? secondaryEvidenceTypeArray.join(", ")
          : null
      }`
    );
  }
  return mechanismEvidenceTypes;
};

const prepareMechanismEvidenceObj = (locusGeneDiseaseData) => {
  // Prepare table header row
  const mechanismEvidenceHeaders = [
    "Publication",
    "Functional Studies",
    "Descriptions",
  ];
  const mechanismEvidenceTableHeaderRow = mechanismEvidenceHeaders.map(
    (item) => {
      return { text: item, style: "tableHeader" };
    }
  );
  // Prepare table body rows
  let mechanismEvidenceTableBodyRows = [];
  for (const [key, value] of Object.entries(
    locusGeneDiseaseData.molecular_mechanism.evidence
  )) {
    mechanismEvidenceTableBodyRows.push([
      {
        text: key,
        link: `https://europepmc.org/article/MED/${key}`,
        style: "link",
      },
      Object.keys(value?.functional_studies || {}).length > 0
        ? {
            ul: getMechanismEvidenceTypes(value.functional_studies),
          }
        : "",
      value?.descriptions?.length > 0
        ? {
            ul: value.descriptions.map((descriptionItem) => descriptionItem),
          }
        : "",
    ]);
  }
  // Prepare table rows (header and body rows)
  const mechanismEvidenceTableRows = [
    mechanismEvidenceTableHeaderRow,
    ...mechanismEvidenceTableBodyRows,
  ];

  return {
    table: {
      headerRows: 1,
      keepWithHeaderRows: 1,
      body: mechanismEvidenceTableRows,
    },
    style: "tableMargin",
  };
};

const preparePhenotypicFeaturesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.phenotypes?.length > 0) {
    // Prepare table header row
    const phenotypicFeaturesHeaders = ["Accession", "Term", "Publications"];
    const phenotypicFeaturesTableHeaderRow = phenotypicFeaturesHeaders.map(
      (item) => {
        return { text: item, style: "tableHeader" };
      }
    );
    // Prepare table body rows
    const phenotypicFeaturesTableBodyRows = locusGeneDiseaseData.phenotypes.map(
      (item) => [
        item.accession
          ? {
              text: item.accession,
              link: `https://hpo.jax.org/app/browse/term/${item.accession}`,
              style: "link",
            }
          : "",
        item.term,
        item.publications?.length > 0
          ? {
              ul: item.publications.map((publicationItem) => {
                return {
                  text: publicationItem,
                  link: `https://europepmc.org/article/MED/${publicationItem}`,
                  style: "link",
                };
              }),
            }
          : "",
      ]
    );
    // Prepare table rows (header and body rows)
    const phenotypicFeaturesTableRows = [
      phenotypicFeaturesTableHeaderRow,
      ...phenotypicFeaturesTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: phenotypicFeaturesTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const preparePhenotypicSummaryObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.phenotype_summary?.length > 0) {
    // Prepare table header row
    const phenotypicSummaryHeaders = ["Publication", "Phenotypic Summary"];
    const phenotypicSummaryTableHeaderRow = phenotypicSummaryHeaders.map(
      (item) => {
        return { text: item, style: "tableHeader" };
      }
    );
    // Prepare table body rows
    const phenotypicSummaryTableBodyRows =
      locusGeneDiseaseData.phenotype_summary.map((item) => [
        item.publication
          ? {
              text: item.publication,
              link: `https://europepmc.org/article/MED/${item.publication}`,
              style: "link",
            }
          : "",
        item.summary,
      ]);
    // Prepare table rows (header and body rows)
    const phenotypicSummaryTableRows = [
      phenotypicSummaryTableHeaderRow,
      ...phenotypicSummaryTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: phenotypicSummaryTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const preparePublicationsEvidenceObj = (
  locusGeneDiseaseData,
  isAuthenticated
) => {
  if (locusGeneDiseaseData.publications?.length > 0) {
    // Prepare table header row
    const publicationsEvidenceTableHeaders = [
      "PMID",
      "Title",
      "Individuals",
      isAuthenticated && "Comments",
    ].filter(Boolean);
    const publicationsEvidenceTableHeaderRow =
      publicationsEvidenceTableHeaders.map((item) => {
        return { text: item, style: "tableHeader" };
      });
    // Prepare table body rows
    let publicationsEvidenceTableBodyRows = [];
    if (isAuthenticated) {
      publicationsEvidenceTableBodyRows = locusGeneDiseaseData.publications.map(
        (item) => {
          return [
            item.publication?.pmid
              ? {
                  text: item.publication.pmid,
                  link: `https://europepmc.org/article/MED/${item.publication.pmid}`,
                  style: "link",
                }
              : "",
            item.publication.title,
            item.number_of_families ||
            item.affected_individuals ||
            item.ancestry ||
            item.consanguinity
              ? {
                  ul: [
                    `Number of Families: ${item.number_of_families}`,
                    `Affected Individuals: ${item.affected_individuals}`,
                    `Ancestry: ${item.ancestry}`,
                    `Consanguinity: ${item.consanguinity}`,
                  ],
                }
              : "",
            item.publication?.comments?.length > 0
              ? {
                  ul: item.publication.comments.map(
                    (commentItem) =>
                      commentItem.comment + " (" + commentItem.date + ")"
                  ),
                }
              : "",
          ];
        }
      );
    } else {
      publicationsEvidenceTableBodyRows = locusGeneDiseaseData.publications.map(
        (item) => {
          return [
            item.publication?.pmid
              ? {
                  text: item.publication.pmid,
                  link: `https://europepmc.org/article/MED/${item.publication.pmid}`,
                  style: "link",
                }
              : "",
            item.publication.title,
            item.number_of_families ||
            item.affected_individuals ||
            item.ancestry ||
            item.consanguinity
              ? {
                  ul: [
                    `Number of Families: ${item.number_of_families}`,
                    `Affected Individuals: ${item.affected_individuals}`,
                    `Ancestry: ${item.ancestry}`,
                    `Consanguinity: ${item.consanguinity}`,
                  ],
                }
              : "",
          ];
        }
      );
    }
    // Prepare table rows (header and body rows)
    const publicationsEvidenceTableRows = [
      publicationsEvidenceTableHeaderRow,
      ...publicationsEvidenceTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: publicationsEvidenceTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const prepareExternalLinksObj = (locusGeneDiseaseData) => {
  // Prepare table header row
  const externalLinksHeaders = ["DECIPHER", "OMIM", "Ensembl ID", "HGNC ID"];
  const externalLinksTableHeaderRow = externalLinksHeaders.map((item) => {
    return { text: item, style: "tableHeader" };
  });
  // Prepare table body rows
  const geneSymbolLink = locusGeneDiseaseData.locus?.gene_symbol
    ? {
        text: locusGeneDiseaseData.locus.gene_symbol,
        link: `https://www.deciphergenomics.org/gene/${locusGeneDiseaseData.locus.gene_symbol}`,
        style: "link",
      }
    : NOT_AVAILABLE;
  const omim = locusGeneDiseaseData.locus?.ids?.OMIM
    ? {
        text: locusGeneDiseaseData.locus.ids.OMIM,
        link: `https://www.omim.org/entry/${locusGeneDiseaseData.locus.ids.OMIM}`,
        style: "link",
      }
    : NOT_AVAILABLE;
  const ensembl = locusGeneDiseaseData.locus?.ids?.Ensembl
    ? {
        text: locusGeneDiseaseData.locus.ids.Ensembl,
        link: `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${locusGeneDiseaseData.locus.ids.Ensembl}`,
        style: "link",
      }
    : NOT_AVAILABLE;
  const hgnc = locusGeneDiseaseData.locus?.ids?.HGNC
    ? {
        text: locusGeneDiseaseData.locus.ids.HGNC,
        link: `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${locusGeneDiseaseData.locus.ids.HGNC}`,
        style: "link",
      }
    : NOT_AVAILABLE;
  const externalLinksTableBodyRow = [geneSymbolLink, omim, ensembl, hgnc];
  // Prepare table rows (header and body row)
  const externalLinksTableRows = [
    externalLinksTableHeaderRow,
    externalLinksTableBodyRow,
  ];

  return {
    table: {
      headerRows: 1,
      keepWithHeaderRows: 1,
      body: externalLinksTableRows,
    },
    style: "tableMargin",
  };
};

const prepareCrossReferencesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.disease?.ontology_terms?.length > 0) {
    // Prepare table header row
    const crossReferencesHeaders = ["Accession", "Term", "Source"];
    const crossReferencesTableHeaderRow = crossReferencesHeaders.map((item) => {
      return { text: item, style: "tableHeader" };
    });
    // Prepare table body rows
    const crossReferencesTableBodyRows =
      locusGeneDiseaseData.disease.ontology_terms.map((item) => [
        item.source === "OMIM"
          ? {
              text: item.accession,
              link: `https://www.omim.org/entry/${item.accession}`,
              style: "link",
            }
          : item.source === "Mondo"
          ? {
              text: item.accession,
              link: `https://monarchinitiative.org/${item.accession}`,
              style: "link",
            }
          : item.accession,
        item.term,
        item.source,
      ]);
    // Prepare table rows (header and body rows)
    const crossReferencesTableRows = [
      crossReferencesTableHeaderRow,
      ...crossReferencesTableBodyRows,
    ];

    return {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 1,
        body: crossReferencesTableRows,
      },
      style: "tableMargin",
    };
  }
  return NOT_AVAILABLE;
};

const prepareCommentsObj = (locusGeneDiseaseData) => {
  // Prepare table header row
  const commentsHeaders = ["Comment", "Type"];
  const commentsTableHeaderRow = commentsHeaders.map((item) => {
    return { text: item, style: "tableHeader" };
  });
  // Prepare table body rows
  const commentsTableBodyRows = locusGeneDiseaseData.comments.map((item) => [
    item.text,
    item.is_public === 1 ? "Public" : item.is_public === 0 ? "Private" : "",
  ]);
  // Prepare table rows (header and body rows)
  const commentsTableRows = [commentsTableHeaderRow, ...commentsTableBodyRows];

  return {
    table: {
      headerRows: 1,
      keepWithHeaderRows: 1,
      body: commentsTableRows,
    },
    style: "tableMargin",
  };
};

const createDocumentDefinition = (
  locusGeneDiseaseData,
  isAuthenticated,
  downloadedDate
) => {
  // Downloaded record page section
  const downloadedRecordPageObj = {
    text: [
      "Downloaded from G2P: ",
      {
        text: window.location.href,
        link: `${window.location.href}`,
        style: ["link"],
      },
    ],
    style: "smallText",
  };
  // Downloaded date section
  const downloadedDateObj = {
    text: [
      "Downloaded on: ",
      {
        text: downloadedDate.toString(),
      },
    ],
    style: "smallText",
  };
  // Disease name section
  const diseaseName = locusGeneDiseaseData.disease?.name
    ? locusGeneDiseaseData.disease.name
    : "Disease Name Not Available";
  const diseaseNameObj = { text: diseaseName, style: "header" };
  // Confidence section
  const confidence = locusGeneDiseaseData.confidence
    ? locusGeneDiseaseData.confidence
    : "";
  const confidenceObj = {
    text: confidence,
    color: "white",
    background: CONFIDENCE_COLOR_MAP[confidence.toLowerCase()],
  };
  // Allelic requirement section
  const allelicRequirementHeaderObj = {
    text: "Allelic Requirement",
    style: "subheader",
  };
  const allelicRequirementObj = locusGeneDiseaseData.genotype
    ? locusGeneDiseaseData.genotype
    : NOT_AVAILABLE;
  // Cross cutting modifiers section
  const crossCuttingModifiersHeaderObj = {
    text: "Cross Cutting Modifiers",
    style: "subheader",
  };
  const crossCuttingModifiersObj =
    locusGeneDiseaseData.cross_cutting_modifier?.length > 0
      ? locusGeneDiseaseData.cross_cutting_modifier
          .map((item) => item.term)
          .join(", ")
      : NOT_ASSIGNED;
  // Panels section
  const panelsHeaderObj = {
    text: "Panels",
    style: "subheader",
  };
  const panelsObj =
    locusGeneDiseaseData.panels?.length > 0
      ? locusGeneDiseaseData.panels
          .map((item) => (item.description ? item.description : item.name))
          .join(", ")
      : NOT_AVAILABLE;
  // Variant information section
  const variantInformationHeaderObj = {
    text: "Variant Information",
    style: "subheader",
  };
  // Variant types section
  const variantTypesHeaderObj = {
    text: "Variant Types",
    style: "subsubheader",
  };
  const variantTypesObj = prepareVariantTypesObj(
    locusGeneDiseaseData,
    isAuthenticated
  );
  // Variant description section
  const variantDescriptionHeaderObj = {
    text: "Variant Description",
    style: "subsubheader",
  };
  const variantDescriptionObj =
    prepareVariantDescriptionObj(locusGeneDiseaseData);
  // Variant consequences section
  const variantConsequencesHeaderObj = {
    text: "Variant Consequences",
    style: "subsubheader",
  };
  const variantConsequencesObj =
    prepareVariantConsequencesObj(locusGeneDiseaseData);
  // Molecular mechanism section
  const molecularMechanismHeaderObj = {
    text: "Molecular Mechanism",
    style: "subheader",
  };
  // Mechanism section
  const mechanismHeaderObj = {
    text: "Mechanism",
    style: "subsubheader",
  };
  const mechanismObj = locusGeneDiseaseData.molecular_mechanism?.mechanism
    ? `${locusGeneDiseaseData.molecular_mechanism.mechanism} ${
        locusGeneDiseaseData.molecular_mechanism?.mechanism_support ===
          "inferred" &&
        locusGeneDiseaseData.molecular_mechanism.mechanism !== "undetermined"
          ? `(${locusGeneDiseaseData.molecular_mechanism.mechanism_support})`
          : ""
      }`
    : NOT_AVAILABLE;
  // Mechanism categorisation section
  const mechanismCategorizationHeaderObj = {
    text: "Categorization",
    style: "subsubheader",
  };
  const mechanismCategorizationObj =
    prepareMechanismCategorisationObj(locusGeneDiseaseData);
  // Mechanism evidence section
  const isDisplayMechanismEvidence =
    locusGeneDiseaseData.molecular_mechanism?.evidence &&
    Object.keys(locusGeneDiseaseData.molecular_mechanism.evidence).length > 0;
  const mechanismEvidenceHeaderObj = {
    text: "Evidence",
    style: "subsubheader",
  };
  const mechanismEvidenceObj =
    prepareMechanismEvidenceObj(locusGeneDiseaseData);
  // Phenotypic features section
  const phenotypicFeaturesHeaderObj = {
    text: "Phenotypic Features",
    style: "subheader",
  };
  const phenotypicFeaturesObj =
    preparePhenotypicFeaturesObj(locusGeneDiseaseData);
  // Phenotypic summary section
  const phenotypicSummaryHeaderObj = {
    text: "Phenotypic Summary",
    style: "subheader",
  };
  const phenotypicSummaryObj =
    preparePhenotypicSummaryObj(locusGeneDiseaseData);
  // Publications evidence section
  const publicationsEvidenceHeaderObj = {
    text: "Evidence",
    style: "subheader",
  };
  const publicationsEvidenceObj = preparePublicationsEvidenceObj(
    locusGeneDiseaseData,
    isAuthenticated
  );
  // Gene information section
  const geneInformationHeaderObj = {
    text: "Gene Information",
    style: "subheader",
  };
  // Gene symbol section
  const geneSymbolHeaderObj = {
    text: "Gene Symbol",
    style: "subsubheader",
  };
  const geneSymbolObj = locusGeneDiseaseData.locus?.gene_symbol
    ? locusGeneDiseaseData.locus?.gene_symbol
    : NOT_AVAILABLE;
  // Gene synonyms section
  const geneSynonymsHeaderObj = {
    text: "Synonyms",
    style: "subsubheader",
  };
  const geneSynonymsObj =
    locusGeneDiseaseData.locus?.synonyms?.length > 0
      ? locusGeneDiseaseData.locus.synonyms.join(", ")
      : NOT_AVAILABLE;
  // Location section
  const locationHeaderObj = {
    text: "Location",
    style: "subsubheader",
  };
  const locationObj =
    locusGeneDiseaseData.locus?.sequence &&
    locusGeneDiseaseData.locus?.start &&
    locusGeneDiseaseData.locus?.end
      ? {
          text: `${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}:${locusGeneDiseaseData.locus.strand}`,
          link: `https://www.ensembl.org/Homo_sapiens/Location/View?r=${locusGeneDiseaseData.locus?.sequence}:${locusGeneDiseaseData.locus?.start}-${locusGeneDiseaseData.locus?.end}`,
          style: ["link"],
        }
      : locusGeneDiseaseData.locus?.sequence ||
        locusGeneDiseaseData.locus?.start ||
        locusGeneDiseaseData.locus?.end
      ? `${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}:${locusGeneDiseaseData.locus.strand}`
      : NOT_AVAILABLE;
  // External links section
  const externalLinksHeaderObj = {
    text: "External Links",
    style: "subsubheader",
  };
  const externalLinksObj = prepareExternalLinksObj(locusGeneDiseaseData);
  // Disease Information section
  const diseaseInformationHeaderObj = {
    text: "Disease Information",
    style: "subheader",
  };
  // Disease name section
  const diseaseNameHeaderObj = {
    text: "Disease Name",
    style: "subsubheader",
  };
  const diseaseNameTextObj = diseaseName;
  // Cross references section
  const crossReferencesHeaderObj = {
    text: "Cross References",
    style: "subsubheader",
  };
  const crossReferencesObj = prepareCrossReferencesObj(locusGeneDiseaseData);
  // G2P ID section
  const g2pIdHeaderObj = {
    text: "G2P ID",
    style: "subheader",
  };
  const g2pIdObj = locusGeneDiseaseData.stable_id
    ? locusGeneDiseaseData.stable_id
    : NOT_AVAILABLE;
  // Comments section
  const isDisplayComments = locusGeneDiseaseData?.comments?.length > 0;
  const commentsHeaderObj = {
    text: "Comments",
    style: "subheader",
  };
  const commentsObj = prepareCommentsObj(locusGeneDiseaseData);
  // Curation Information section
  const curationInformationHeaderObj = {
    text: "Curation Information",
    style: "subheader",
  };
  // Created on section
  const createdOnDateHeaderObj = {
    text: "Created On",
    style: "subsubheader",
  };
  const createdOnDateObj = locusGeneDiseaseData.date_created
    ? locusGeneDiseaseData.date_created
    : NOT_AVAILABLE;
  // Last updated on section
  const lastUpdatedOnDateHeaderObj = {
    text: "Last Updated On",
    style: "subsubheader",
  };
  const lastUpdatedOnDateObj = locusGeneDiseaseData.last_updated
    ? locusGeneDiseaseData.last_updated
    : NOT_AVAILABLE;

  // return documentDefinition object
  return {
    pageMargins: 20,
    footer: function (currentPage, pageCount) {
      return {
        text: "Page " + currentPage.toString() + " of " + pageCount,
        alignment: "right",
        style: "footerMargin",
      };
    },
    content: [
      downloadedRecordPageObj,
      downloadedDateObj,
      "\n",
      diseaseNameObj,
      confidenceObj,
      "\n",
      allelicRequirementHeaderObj,
      allelicRequirementObj,
      "\n",
      crossCuttingModifiersHeaderObj,
      crossCuttingModifiersObj,
      "\n",
      panelsHeaderObj,
      panelsObj,
      "\n",
      variantInformationHeaderObj,
      "\n",
      variantTypesHeaderObj,
      variantTypesObj,
      "\n",
      variantDescriptionHeaderObj,
      variantDescriptionObj,
      "\n",
      variantConsequencesHeaderObj,
      variantConsequencesObj,
      "\n",
      molecularMechanismHeaderObj,
      "\n",
      mechanismHeaderObj,
      mechanismObj,
      "\n",
      mechanismCategorizationHeaderObj,
      mechanismCategorizationObj,
      "\n",
      isDisplayMechanismEvidence ? mechanismEvidenceHeaderObj : "",
      isDisplayMechanismEvidence ? mechanismEvidenceObj : "",
      isDisplayMechanismEvidence ? "\n" : "",
      phenotypicFeaturesHeaderObj,
      phenotypicFeaturesObj,
      "\n",
      phenotypicSummaryHeaderObj,
      phenotypicSummaryObj,
      "\n",
      publicationsEvidenceHeaderObj,
      publicationsEvidenceObj,
      "\n",
      geneInformationHeaderObj,
      "\n",
      geneSymbolHeaderObj,
      geneSymbolObj,
      "\n",
      geneSynonymsHeaderObj,
      geneSynonymsObj,
      "\n",
      locationHeaderObj,
      locationObj,
      "\n",
      externalLinksHeaderObj,
      externalLinksObj,
      "\n",
      diseaseInformationHeaderObj,
      "\n",
      diseaseNameHeaderObj,
      diseaseNameTextObj,
      "\n",
      crossReferencesHeaderObj,
      crossReferencesObj,
      "\n",
      g2pIdHeaderObj,
      g2pIdObj,
      "\n",
      isDisplayComments ? commentsHeaderObj : "",
      isDisplayComments ? commentsObj : "",
      isDisplayComments ? "\n" : "",
      curationInformationHeaderObj,
      "\n",
      createdOnDateHeaderObj,
      createdOnDateObj,
      "\n",
      lastUpdatedOnDateHeaderObj,
      lastUpdatedOnDateObj,
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      subsubheader: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        bold: true,
      },
      link: {
        color: "blue",
        decoration: "underline",
      },
      tableMargin: {
        marginTop: 5,
      },
      footerMargin: {
        marginRight: 5,
      },
      smallText: {
        fontSize: 8,
        bold: true,
      },
    },
  };
};

export const exportRecordPdf = (locusGeneDiseaseData, isAuthenticated) => {
  const downloadedDate = new Date();
  const documentDefinition = createDocumentDefinition(
    locusGeneDiseaseData,
    isAuthenticated,
    downloadedDate
  );
  const fileName = `${
    locusGeneDiseaseData.stable_id
  }_${downloadedDate.toISOString()}.pdf`;
  pdfMake.createPdf(documentDefinition).download(fileName);
};
