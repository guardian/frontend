// @flow
import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { loadScript, getLocale } from '@guardian/libs';

const loadIpsosScript = () => {

    window.dm = window.dm ||{ AjaxData:[]};
    window.dm.AjaxEvent = (et, d, ssid, ad) => {
        // $FlowFixMe
        dm.AjaxData.push({ et,d,ssid,ad}); // eslint-disable-line no-undef
        if (window.DotMetricsObj) {
                // $FlowFixMe
                DotMetricsObj.onAjaxDataUpdate(); // eslint-disable-line no-undef
        }
    };
    const ipsosSource = `https://uk-script.dotmetrics.net/door.js?d=${  document.location.host  }&t=${ config.get('page.ipsosTag')}`;

    return loadScript(ipsosSource, { id: 'ipsos', async: true, type: 'text/javascript' });
};

export const init = (): Promise<void> => {

    getLocale().then((locale) => {
        if(locale === 'GB') {
            onConsentChange(state => {
                if (getConsentFor('ipsos', state)) {
                    return loadIpsosScript();
                }
            });
        }
    });

    return Promise.resolve();
};

