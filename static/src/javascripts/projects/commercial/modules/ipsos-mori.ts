
import { onConsentChange, getConsentFor } from "@guardian/consent-management-platform";
import config from "lib/config";
import { loadScript, getLocale } from "@guardian/libs";

/* Sections to be included in initial release of Ipsos Mori tagging */
const allowSections = ["lifeandstyle",
/* Lifestyle sections */
"fashion", "food", "travel", "fashion", "money", "technology", "culture",
/* Culture sections */
"film", "music", "tv-and-radio", "books", "artanddesign", "stage", "games", "sport",
/* Sport sections */
"football"];

const loadIpsosScript = () => {

  window.dm = window.dm || { AjaxData: [] };
  window.dm.AjaxEvent = (et, d, ssid, ad) => {
    // $FlowFixMe
    dm.AjaxData.push({ et, d, ssid, ad }); // eslint-disable-line no-undef
    if (window.DotMetricsObj) {
      // $FlowFixMe
      DotMetricsObj.onAjaxDataUpdate(); // eslint-disable-line no-undef
    }
  };
  const ipsosSource = `https://uk-script.dotmetrics.net/door.js?d=${document.location.host}&t=${config.get('page.ipsosTag')}`;

  return loadScript(ipsosSource, { id: 'ipsos', async: true, type: 'text/javascript' });
};

export const init = (): Promise<void> => {

  getLocale().then(locale => {
    if (locale === 'GB') {
      onConsentChange(state => {
        if (getConsentFor('ipsos', state)) {
          if (allowSections.includes(config.get('page.section'))) {
            return loadIpsosScript();
          }
        }
      });
    }
  });

  return Promise.resolve();
};