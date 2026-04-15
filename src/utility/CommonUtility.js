import { EUROPE_PMC_QUERY_URL } from "./UrlConstants.js";

export const viewSelectedPublications = (selectedPublicationsList) => {
  // Prepare EuropePMC url
  // Example:
  // If selectedPublicationsList = [1,2]
  // Then expected EuropePMC URL is "https://europepmc.org/search?query=(((EXT_ID:(1)) OR (EXT_ID:(2))) AND SRC:MED)"
  const url = `${EUROPE_PMC_QUERY_URL}((${selectedPublicationsList
    .map((pmid) => `(EXT_ID:(${pmid}))`)
    .join(" OR ")}) AND SRC:MED)`;
  // Open in new tab
  window.open(url, "_blank", "noopener,noreferrer");
};

export const parseDetailsInput = (rawDetails) => {
  if (rawDetails == null || rawDetails === "") {
    return { valid: true, value: "" };
  }
  if (typeof rawDetails === "object") {
    return { valid: true, value: rawDetails };
  }
  if (typeof rawDetails === "string") {
    const trimmed = rawDetails.trim();
    if (!trimmed) return { valid: true, value: "" };
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        return { valid: true, value: parsed };
      }
      return { valid: false, error: "Details must be a JSON object or array." };
    } catch (e) {
      return { valid: false, error: "Details must be valid JSON." };
    }
  }
  return { valid: false, error: "Details must be valid JSON." };
};
