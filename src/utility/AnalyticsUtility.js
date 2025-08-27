import { event } from "vue-gtag";

export const trackPanelDownload = (panelName) => {
  // track panel download event
  event("download_panel_data", {
    panel_name: panelName,
  });
};

export const trackRecordDownload = (stableId) => {
  // track record download event
  event("download_record_data", {
    record_stable_id: stableId,
  });
};
