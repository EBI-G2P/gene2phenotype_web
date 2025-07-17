import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  CONFIDENCE_COLOR_MAP,
  NOT_AVAILABLE,
  NOT_ASSIGNED,
} from "./Constants.js";
import {
  DECIPHER_URL,
  ENSEMBL_GENE_URL,
  ENSEMBL_LOCATION_URL,
  EUROPE_PMC_URL,
  HGNC_URL,
  HPO_URL,
  MONDO_URL,
  OMIM_URL,
  SEQUENCE_ONTOLOGY_URL,
} from "./UrlConstants.js";

// Set the fonts
pdfMake.addVirtualFileSystem(pdfFonts);

const createHeaderObj = (text) => {
  return { text: text, style: "header" };
};

const createSubHeader = (text) => {
  return {
    text: text,
    style: "subheader",
  };
};

const createSubSubHeader = (text) => {
  return {
    text: text,
    style: "subsubheader",
  };
};

const createLinkObj = (text, link) => {
  return {
    text: text,
    link: link,
    style: "link",
  };
};

const createTableHeaderRow = (headers) => {
  return headers.map((item) => {
    return { text: item, style: "tableHeader" };
  });
};

const createTableObj = (tableRows) => {
  return {
    table: {
      headerRows: 1,
      keepWithHeaderRows: 1,
      body: tableRows,
    },
    style: "tableMargin",
  };
};

const prepareVariantTypesObj = (locusGeneDiseaseData, isAuthenticated) => {
  if (locusGeneDiseaseData.variant_type?.length > 0) {
    // Prepare table header row
    let variantTypesTableHeaders = ["Type", "Inheritance", "Publications"];
    // If user is authenticated, then include comment header column
    if (isAuthenticated) {
      variantTypesTableHeaders.push("Comments");
    }
    const variantTypesTableHeaderRow = createTableHeaderRow(
      variantTypesTableHeaders
    );
    // Prepare table body rows
    let variantTypesTableBodyRows = [];
    locusGeneDiseaseData.variant_type.forEach((item) => {
      let tableBodyRow = [
        item.accession
          ? createLinkObj(item.term, SEQUENCE_ONTOLOGY_URL + item.accession)
          : item.term,
        item.de_novo || item.inherited || item.unknown_inheritance
          ? {
              ul: [
                item.de_novo ? "De Novo" : "",
                item.inherited ? "Inherited" : "",
                item.unknown_inheritance ? "Unknown Inheritance" : "",
              ],
            }
          : "",
        item.publications?.length > 0
          ? {
              ul: item.publications.map((publicationItem) => {
                return createLinkObj(
                  publicationItem,
                  EUROPE_PMC_URL + publicationItem
                );
              }),
            }
          : "",
      ];
      // If user is authenticated, then include comment column data
      if (isAuthenticated) {
        tableBodyRow.push(
          item.comments?.length > 0
            ? {
                ul: item.comments.map(
                  (commentItem) =>
                    commentItem.text + " (" + commentItem.date + ")"
                ),
              }
            : ""
        );
      }
      variantTypesTableBodyRows.push(tableBodyRow);
    });

    // Prepare table rows (header and body rows)
    const variantTypesTableRows = [
      variantTypesTableHeaderRow,
      ...variantTypesTableBodyRows,
    ];

    // Return table object
    return createTableObj(variantTypesTableRows);
  }
  return NOT_AVAILABLE;
};

const prepareVariantDescriptionObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.variant_description?.length > 0) {
    // Prepare table header row
    const variantDescriptionHeaders = ["Variant Description", "Publications"];
    const variantDescriptionTableHeaderRow = createTableHeaderRow(
      variantDescriptionHeaders
    );
    // Prepare table body rows
    const variantDescriptionTableBodyRows =
      locusGeneDiseaseData.variant_description.map((item) => [
        item.description,
        item.publications?.length > 0
          ? {
              ul: item.publications.map((publicationItem) => {
                return createLinkObj(
                  publicationItem,
                  EUROPE_PMC_URL + publicationItem
                );
              }),
            }
          : "",
      ]);
    // Prepare table rows (header and body rows)
    const variantDescriptionTableRows = [
      variantDescriptionTableHeaderRow,
      ...variantDescriptionTableBodyRows,
    ];

    // Return table object
    return createTableObj(variantDescriptionTableRows);
  }
  return NOT_AVAILABLE;
};

const prepareVariantConsequencesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.variant_consequence?.length > 0) {
    // Prepare table header row
    const variantConsequencesHeaders = ["Variant Consequence", "Support"];
    const variantConsequencesTableHeaderRow = createTableHeaderRow(
      variantConsequencesHeaders
    );
    // Prepare table body rows
    const variantConsequencesTableBodyRows =
      locusGeneDiseaseData.variant_consequence.map((item) => [
        item.accession
          ? createLinkObj(
              item.variant_consequence,
              SEQUENCE_ONTOLOGY_URL + item.accession
            )
          : item.variant_consequence,
        item.support,
      ]);
    // Prepare table rows (header and body rows)
    const variantConsequencesTableRows = [
      variantConsequencesTableHeaderRow,
      ...variantConsequencesTableBodyRows,
    ];

    // Return table object
    return createTableObj(variantConsequencesTableRows);
  }
  return NOT_AVAILABLE;
};

const prepareMechanismCategorisationObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.molecular_mechanism?.synopsis?.length > 0) {
    // Prepare table header row
    const mechanismCategorisationHeaders = ["Categorisation", "Support"];
    const mechanismCategorisationTableHeaderRow = createTableHeaderRow(
      mechanismCategorisationHeaders
    );
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

    // Return table object
    return createTableObj(mechanismCategorisationTableRows);
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
  const mechanismEvidenceTableHeaderRow = createTableHeaderRow(
    mechanismEvidenceHeaders
  );
  // Prepare table body rows
  let mechanismEvidenceTableBodyRows = [];
  for (const [key, value] of Object.entries(
    locusGeneDiseaseData.molecular_mechanism.evidence
  )) {
    mechanismEvidenceTableBodyRows.push([
      createLinkObj(key, EUROPE_PMC_URL + key),
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

  // Return table object
  return createTableObj(mechanismEvidenceTableRows);
};

const preparePhenotypicFeaturesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.phenotypes?.length > 0) {
    // Prepare table header row
    const phenotypicFeaturesHeaders = ["Accession", "Term", "Publications"];
    const phenotypicFeaturesTableHeaderRow = createTableHeaderRow(
      phenotypicFeaturesHeaders
    );
    // Prepare table body rows
    const phenotypicFeaturesTableBodyRows = locusGeneDiseaseData.phenotypes.map(
      (item) => [
        item.accession
          ? createLinkObj(item.accession, HPO_URL + item.accession)
          : "",
        item.term,
        item.publications?.length > 0
          ? {
              ul: item.publications.map((publicationItem) => {
                return createLinkObj(
                  publicationItem,
                  EUROPE_PMC_URL + publicationItem
                );
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

    // Return table object
    return createTableObj(phenotypicFeaturesTableRows);
  }
  return NOT_AVAILABLE;
};

const preparePhenotypicSummaryObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.phenotype_summary?.length > 0) {
    // Prepare table header row
    const phenotypicSummaryHeaders = ["Publication", "Phenotypic Summary"];
    const phenotypicSummaryTableHeaderRow = createTableHeaderRow(
      phenotypicSummaryHeaders
    );
    // Prepare table body rows
    const phenotypicSummaryTableBodyRows =
      locusGeneDiseaseData.phenotype_summary.map((item) => [
        item.publication
          ? createLinkObj(item.publication, EUROPE_PMC_URL + item.publication)
          : "",
        item.summary,
      ]);
    // Prepare table rows (header and body rows)
    const phenotypicSummaryTableRows = [
      phenotypicSummaryTableHeaderRow,
      ...phenotypicSummaryTableBodyRows,
    ];

    // Return table object
    return createTableObj(phenotypicSummaryTableRows);
  }
  return NOT_AVAILABLE;
};

const preparePublicationsEvidenceObj = (
  locusGeneDiseaseData,
  isAuthenticated
) => {
  if (locusGeneDiseaseData.publications?.length > 0) {
    // Prepare table header row
    let publicationsEvidenceTableHeaders = ["PMID", "Title", "Individuals"];
    // If user is authenticated, then include comment header column
    if (isAuthenticated) {
      publicationsEvidenceTableHeaders.push("Comments");
    }
    const publicationsEvidenceTableHeaderRow = createTableHeaderRow(
      publicationsEvidenceTableHeaders
    );
    // Prepare table body rows
    let publicationsEvidenceTableBodyRows = [];
    locusGeneDiseaseData.publications.forEach((item) => {
      let bodyRow = [
        item.publication?.pmid
          ? createLinkObj(
              item.publication.pmid,
              EUROPE_PMC_URL + item.publication.pmid
            )
          : "",
        item.publication.title,
        item.number_of_families ||
        item.affected_individuals ||
        item.ancestry ||
        item.consanguinity
          ? {
              ul: [
                `Number of Families: ${item.number_of_families ?? ""}`,
                `Affected Individuals: ${item.affected_individuals ?? ""}`,
                `Ancestry: ${item.ancestry ?? ""}`,
                `Consanguinity: ${item.consanguinity ?? ""}`,
              ],
            }
          : "",
      ];
      // If user is authenticated, then include comment column data
      if (isAuthenticated) {
        bodyRow.push(
          item.publication?.comments?.length > 0
            ? {
                ul: item.publication.comments.map(
                  (commentItem) =>
                    commentItem.comment + " (" + commentItem.date + ")"
                ),
              }
            : ""
        );
      }
      publicationsEvidenceTableBodyRows.push(bodyRow);
    });
    // Prepare table rows (header and body rows)
    const publicationsEvidenceTableRows = [
      publicationsEvidenceTableHeaderRow,
      ...publicationsEvidenceTableBodyRows,
    ];

    // Return table object
    return createTableObj(publicationsEvidenceTableRows);
  }
  return NOT_AVAILABLE;
};

const prepareExternalLinksObj = (locusGeneDiseaseData) => {
  // Prepare table header row
  const externalLinksHeaders = ["DECIPHER", "OMIM", "Ensembl ID", "HGNC ID"];
  const externalLinksTableHeaderRow =
    createTableHeaderRow(externalLinksHeaders);
  // Prepare table body rows
  const geneSymbolLink = locusGeneDiseaseData.locus?.gene_symbol
    ? createLinkObj(
        locusGeneDiseaseData.locus.gene_symbol,
        DECIPHER_URL + locusGeneDiseaseData.locus.gene_symbol
      )
    : NOT_AVAILABLE;
  const omim = locusGeneDiseaseData.locus?.ids?.OMIM
    ? createLinkObj(
        locusGeneDiseaseData.locus.ids.OMIM,
        OMIM_URL + locusGeneDiseaseData.locus.ids.OMIM
      )
    : NOT_AVAILABLE;
  const ensembl = locusGeneDiseaseData.locus?.ids?.Ensembl
    ? createLinkObj(
        locusGeneDiseaseData.locus.ids.Ensembl,
        ENSEMBL_GENE_URL + locusGeneDiseaseData.locus.ids.Ensembl
      )
    : NOT_AVAILABLE;
  const hgnc = locusGeneDiseaseData.locus?.ids?.HGNC
    ? createLinkObj(
        locusGeneDiseaseData.locus.ids.HGNC,
        HGNC_URL + locusGeneDiseaseData.locus.ids.HGNC
      )
    : NOT_AVAILABLE;
  const externalLinksTableBodyRow = [geneSymbolLink, omim, ensembl, hgnc];
  // Prepare table rows (header and body row)
  const externalLinksTableRows = [
    externalLinksTableHeaderRow,
    externalLinksTableBodyRow,
  ];

  // Return table object
  return createTableObj(externalLinksTableRows);
};

const prepareCrossReferencesObj = (locusGeneDiseaseData) => {
  if (locusGeneDiseaseData.disease?.ontology_terms?.length > 0) {
    // Prepare table header row
    const crossReferencesHeaders = ["Accession", "Term", "Source"];
    const crossReferencesTableHeaderRow = createTableHeaderRow(
      crossReferencesHeaders
    );
    // Prepare table body rows
    const crossReferencesTableBodyRows =
      locusGeneDiseaseData.disease.ontology_terms.map((item) => [
        item.source === "OMIM"
          ? createLinkObj(item.accession, OMIM_URL + item.accession)
          : item.source === "Mondo"
          ? createLinkObj(item.accession, MONDO_URL + item.accession)
          : item.accession,
        item.term,
        item.source,
      ]);
    // Prepare table rows (header and body rows)
    const crossReferencesTableRows = [
      crossReferencesTableHeaderRow,
      ...crossReferencesTableBodyRows,
    ];

    // Return table object
    return createTableObj(crossReferencesTableRows);
  }
  return NOT_AVAILABLE;
};

const prepareCommentsObj = (locusGeneDiseaseData) => {
  // Prepare table header row
  const commentsHeaders = ["Comment", "Type"];
  const commentsTableHeaderRow = createTableHeaderRow(commentsHeaders);
  // Prepare table body rows
  const commentsTableBodyRows = locusGeneDiseaseData.comments.map((item) => [
    item.text,
    item.is_public === 1 ? "Public" : item.is_public === 0 ? "Private" : "",
  ]);
  // Prepare table rows (header and body rows)
  const commentsTableRows = [commentsTableHeaderRow, ...commentsTableBodyRows];

  // Return table object
  return createTableObj(commentsTableRows);
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
      createLinkObj(window.location.href, window.location.href),
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
  const diseaseNameObj = createHeaderObj(diseaseName);
  // Confidence section
  const confidence = locusGeneDiseaseData.confidence
    ? locusGeneDiseaseData.confidence
    : "";
  const confidenceObj = {
    text: confidence,
    color: "white",
    background: CONFIDENCE_COLOR_MAP[confidence.toLowerCase()],
  };
  // Review status section
  const reviewStatus =
    locusGeneDiseaseData.is_reviewed === false ? "Under review" : "";
  const reviewStatusObj = reviewStatus
    ? {
        text: reviewStatus,
        style: "reviewStatusText",
      }
    : reviewStatus;
  // Allelic requirement section
  const allelicRequirementHeaderObj = createSubHeader("Allelic Requirement");
  const allelicRequirementObj = locusGeneDiseaseData.genotype
    ? locusGeneDiseaseData.genotype
    : NOT_AVAILABLE;
  // Cross cutting modifiers section
  const crossCuttingModifiersHeaderObj = createSubHeader(
    "Cross Cutting Modifiers"
  );
  const crossCuttingModifiersObj =
    locusGeneDiseaseData.cross_cutting_modifier?.length > 0
      ? locusGeneDiseaseData.cross_cutting_modifier
          .map((item) => item.term)
          .join(", ")
      : NOT_ASSIGNED;
  // Panels section
  const panelsHeaderObj = createSubHeader("Panels");
  const panelsObj =
    locusGeneDiseaseData.panels?.length > 0
      ? locusGeneDiseaseData.panels
          .map((item) => (item.description ? item.description : item.name))
          .join(", ")
      : NOT_AVAILABLE;
  // Variant information section
  const variantInformationHeaderObj = createSubHeader("Variant Information");
  // Variant types section
  const variantTypesHeaderObj = createSubSubHeader("Variant Types");
  const variantTypesObj = prepareVariantTypesObj(
    locusGeneDiseaseData,
    isAuthenticated
  );
  // Variant description section
  const variantDescriptionHeaderObj = createSubSubHeader("Variant Description");
  const variantDescriptionObj =
    prepareVariantDescriptionObj(locusGeneDiseaseData);
  // Variant consequences section
  const variantConsequencesHeaderObj = createSubSubHeader(
    "Variant Consequences"
  );
  const variantConsequencesObj =
    prepareVariantConsequencesObj(locusGeneDiseaseData);
  // Molecular mechanism section
  const molecularMechanismHeaderObj = createSubHeader("Molecular Mechanism");
  // Mechanism section
  const mechanismHeaderObj = createSubSubHeader("Mechanism");
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
  const mechanismCategorisationHeaderObj = createSubSubHeader("Categorisation");
  const mechanismCategorisationObj =
    prepareMechanismCategorisationObj(locusGeneDiseaseData);
  // Mechanism evidence section
  const isDisplayMechanismEvidenceSection =
    locusGeneDiseaseData.molecular_mechanism?.evidence &&
    Object.keys(locusGeneDiseaseData.molecular_mechanism.evidence).length > 0;
  const mechanismEvidenceHeaderObj = createSubSubHeader("Evidence");
  const mechanismEvidenceObj =
    prepareMechanismEvidenceObj(locusGeneDiseaseData);
  // Phenotypic features section
  const phenotypicFeaturesHeaderObj = createSubHeader("Phenotypic Features");
  const phenotypicFeaturesObj =
    preparePhenotypicFeaturesObj(locusGeneDiseaseData);
  // Phenotypic summary section
  const phenotypicSummaryHeaderObj = createSubHeader("Phenotypic Summary");
  const phenotypicSummaryObj =
    preparePhenotypicSummaryObj(locusGeneDiseaseData);
  // Publications evidence section
  const publicationsEvidenceHeaderObj = createSubHeader("Evidence");
  const publicationsEvidenceObj = preparePublicationsEvidenceObj(
    locusGeneDiseaseData,
    isAuthenticated
  );
  // Gene information section
  const geneInformationHeaderObj = createSubHeader("Gene Information");
  // Gene symbol section
  const geneSymbolHeaderObj = createSubSubHeader("Gene Symbol");
  const geneSymbolObj = locusGeneDiseaseData.locus?.gene_symbol
    ? locusGeneDiseaseData.locus?.gene_symbol
    : NOT_AVAILABLE;
  // Gene synonyms section
  const geneSynonymsHeaderObj = createSubSubHeader("Synonyms");
  const geneSynonymsObj =
    locusGeneDiseaseData.locus?.synonyms?.length > 0
      ? locusGeneDiseaseData.locus.synonyms.join(", ")
      : NOT_AVAILABLE;
  // Location section
  const locationHeaderObj = createSubSubHeader("Location");
  const locationObj =
    locusGeneDiseaseData.locus?.sequence &&
    locusGeneDiseaseData.locus?.start &&
    locusGeneDiseaseData.locus?.end
      ? createLinkObj(
          `${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}:${locusGeneDiseaseData.locus.strand}`,
          `${ENSEMBL_LOCATION_URL}${locusGeneDiseaseData.locus?.sequence}:${locusGeneDiseaseData.locus?.start}-${locusGeneDiseaseData.locus?.end}`
        )
      : locusGeneDiseaseData.locus?.sequence ||
        locusGeneDiseaseData.locus?.start ||
        locusGeneDiseaseData.locus?.end
      ? `${locusGeneDiseaseData.locus.sequence}:${locusGeneDiseaseData.locus.start}-${locusGeneDiseaseData.locus.end}:${locusGeneDiseaseData.locus.strand}`
      : NOT_AVAILABLE;
  // External links section
  const externalLinksHeaderObj = createSubSubHeader("External Links");
  const externalLinksObj = prepareExternalLinksObj(locusGeneDiseaseData);
  // Disease Information section
  const diseaseInformationHeaderObj = createSubHeader("Disease Information");
  // Disease name section
  const diseaseNameHeaderObj = createSubSubHeader("Disease Name");
  const diseaseNameTextObj = diseaseName;
  // Cross references section
  const crossReferencesHeaderObj = createSubSubHeader("Cross References");
  const crossReferencesObj = prepareCrossReferencesObj(locusGeneDiseaseData);
  // G2P ID section
  const g2pIdHeaderObj = createSubHeader("G2P ID");
  const g2pIdObj = locusGeneDiseaseData.stable_id
    ? locusGeneDiseaseData.stable_id
    : NOT_AVAILABLE;
  // Comments section
  const isDisplayCommentsSection = locusGeneDiseaseData?.comments?.length > 0;
  const commentsHeaderObj = createSubHeader("Comments");
  const commentsObj = prepareCommentsObj(locusGeneDiseaseData);
  // Curation Information section
  const curationInformationHeaderObj = createSubHeader("Curation Information");
  // Created on section
  const createdOnDateHeaderObj = createSubSubHeader("Created On");
  const createdOnDateObj = locusGeneDiseaseData.date_created
    ? locusGeneDiseaseData.date_created
    : NOT_AVAILABLE;
  // Last updated on section
  const lastUpdatedOnDateHeaderObj = createSubSubHeader("Last Updated On");
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
      reviewStatusObj,
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
      mechanismCategorisationHeaderObj,
      mechanismCategorisationObj,
      "\n",
      isDisplayMechanismEvidenceSection ? mechanismEvidenceHeaderObj : "",
      isDisplayMechanismEvidenceSection ? mechanismEvidenceObj : "",
      isDisplayMechanismEvidenceSection ? "\n" : "",
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
      isDisplayCommentsSection ? commentsHeaderObj : "",
      isDisplayCommentsSection ? commentsObj : "",
      isDisplayCommentsSection ? "\n" : "",
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
      reviewStatusText: {
        color: "white",
        background: "#ffc107",
        marginTop: 5,
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
