// G2P API URLS
export const G2P_API_BASE_URL = "/gene2phenotype/api";
export const LOGIN_URL = `${G2P_API_BASE_URL}/login/`;
export const LOGOUT_URL = `${G2P_API_BASE_URL}/logout/`;
export const REFRESH_TOKEN_URL = `${G2P_API_BASE_URL}/token/refresh/`;
export const CHANGE_PASSWORD_URL = `${G2P_API_BASE_URL}/change_password/`;
export const RESET_PASSWORD_URL = `${G2P_API_BASE_URL}/reset_password/:uid/:token/`;
export const VERIFY_EMAIL_URL = `${G2P_API_BASE_URL}/verify/email/`;
export const PROFILE_URL = `${G2P_API_BASE_URL}/profile/`;
export const ALL_PANELS_URL = `${G2P_API_BASE_URL}/panels/`;
export const PANEL_URL = `${G2P_API_BASE_URL}/panel/:panelname/`;
export const PANEL_SUMMARY_URL = `${G2P_API_BASE_URL}/panel/:panelname/summary/`;
export const USER_PANELS_URL = `${G2P_API_BASE_URL}/user/panels/`;
export const DOWNLOAD_PANEL_URL = `${G2P_API_BASE_URL}/panel/:panelname/download/`;
export const SEARCH_URL = `${G2P_API_BASE_URL}/search/`;
export const GENE_URL = `${G2P_API_BASE_URL}/gene/:locus/`;
export const GENE_SUMMARY_URL = `${G2P_API_BASE_URL}/gene/:locus/summary/`;
export const GENE_FUNCTION_URL = `${G2P_API_BASE_URL}/gene/:locus/function/`;
export const GENE_DISEASE_URL = `${G2P_API_BASE_URL}/gene/:locus/disease/`;
export const ATTRIBS_URL = `${G2P_API_BASE_URL}/attribs/`;
export const ATTRIBS_DESCRIPTION_URL = `${G2P_API_BASE_URL}/attribs/description/`;
export const PUBLICATIONS_URL = `${G2P_API_BASE_URL}/publication/:pmids/`;
export const MECHANISMS_URL = `${G2P_API_BASE_URL}/molecular_mechanisms/`;
export const VARIANT_TYPES_URL = `${G2P_API_BASE_URL}/ontology_terms/variant_types/`;
export const SAVE_DRAFT_URL = `${G2P_API_BASE_URL}/add/curation/`;
export const SAVED_DRAFT_DATA_URL = `${G2P_API_BASE_URL}/curation/:stableid/`;
export const UPDATE_SAVED_DRAFT_URL = `${G2P_API_BASE_URL}/curation/:stableid/update/`;
export const ALL_SAVED_DRAFTS_URL = `${G2P_API_BASE_URL}/curations/`;
export const PUBLISH_URL = `${G2P_API_BASE_URL}/curation/publish/:stableid/`;
export const DISEASE_URL = `${G2P_API_BASE_URL}/disease/:diseasename/`;
export const DISEASE_SUMMARY_URL = `${G2P_API_BASE_URL}/disease/:diseasename/summary/`;
export const LGD_RECORD_URL = `${G2P_API_BASE_URL}/lgd/:stableid/`;
export const ADD_PANEL_URL = `${G2P_API_BASE_URL}/lgd/:stableid/panel/`;
export const UPDATE_CONFIDENCE_URL = `${G2P_API_BASE_URL}/lgd/:stableid/update_confidence/`;
export const UPDATE_MECHANISM_URL = `${G2P_API_BASE_URL}/lgd/:stableid/update_mechanism/`;
export const ADD_PUBLICATION_URL = `${G2P_API_BASE_URL}/lgd/:stableid/publication/`;
export const ADD_COMMENT_URL = `${G2P_API_BASE_URL}/lgd/:stableid/comment/`;
export const REFERENCE_DATA_URL = `${G2P_API_BASE_URL}/reference_data/`;
export const UPDATE_PHENOTYPE_URL = `${G2P_API_BASE_URL}/lgd/:stableid/phenotype/`;
export const UPDATE_VARIANT_CONSEQUENCE_URL = `${G2P_API_BASE_URL}/lgd/:stableid/variant_consequence/`;
export const UPDATE_VARIANT_TYPE_URL = `${G2P_API_BASE_URL}/lgd/:stableid/variant_type/`;
export const UPDATE_CROSS_REFERENCE_URL = `${G2P_API_BASE_URL}/disease/:diseaseid/cross_references/`;
export const CROSS_REFERENCE_URL = `${G2P_API_BASE_URL}/external_disease/:crossreferences/`;
export const UPDATE_DISEASE_NAME_URL = `${G2P_API_BASE_URL}/update/diseases/`;
export const UPDATE_REVIEW_STATUS_URL = `${G2P_API_BASE_URL}/lgd/:stableid/review/`;
export const UPDATE_COMMENT_URL = `${G2P_API_BASE_URL}/lgd/:stableid/comment/`;
export const UPDATE_MINED_PUBLICATION_URL = `${G2P_API_BASE_URL}/lgd/:stableid/mined_publication/`;

//External API URLS
export const HPO_SEARCH_API_URL = "https://ontology.jax.org/api/hp/search";
export const HPO_URL = "https://hpo.jax.org/app/browse/term/";
export const SEQUENCE_ONTOLOGY_URL =
  "http://www.sequenceontology.org/browser/current_release/term/";
export const EUROPE_PMC_URL = "https://europepmc.org/article/MED/";
export const EUROPE_PMC_QUERY_URL = "https://europepmc.org/search?query=";
export const DECIPHER_URL = "https://www.deciphergenomics.org/gene/";
export const OMIM_URL = "https://www.omim.org/entry/";
export const HGNC_URL =
  "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/";
export const ENSEMBL_GENE_URL =
  "https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=";
export const ENSEMBL_LOCATION_URL =
  "https://www.ensembl.org/Homo_sapiens/Location/View?r=";
export const MONDO_URL = "https://monarchinitiative.org/";
export const PANELAPP_URL =
  "https://panelapp.genomicsengland.co.uk/panels/entities/";
export const GENCC_URL = "https://search.thegencc.org/genes/";
export const UNIPROT_URL = "https://www.uniprot.org/uniprotkb/";
export const CLINGEN_URL = "https://search.clinicalgenome.org/kb/genes/";
