import { event } from "vue-gtag";

export const trackPanelDownload = (panelName) => {
  // track panel download event
  event("download_panel_data", {
    panel_name: panelName,
  });
};
