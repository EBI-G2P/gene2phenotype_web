import { EUROPE_PMC_QUERY_URL } from "./UrlConstants.js";

export const viewSelectedPublications = (selectedPublicationsList) => {
  // Prepare EuropePMC url
  // Example:
  // If selectedPublicationsList = [1,2]
  // Then expected EuropePMC URL is "https://europepmc.org/search?query=((EXT_ID:(1) AND SRC:MED) OR (EXT_ID:(2) AND SRC:MED))"
  const url = `${EUROPE_PMC_QUERY_URL}(${selectedPublicationsList
    .map((pmid) => `(EXT_ID:(${pmid}) AND SRC:MED)`)
    .join(" OR ")})`;
  // Open in new tab
  window.open(url, "_blank", "noopener,noreferrer");
};
