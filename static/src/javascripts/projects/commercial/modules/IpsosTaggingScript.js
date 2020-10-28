// @flow
import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import config from 'lib/config';

const IpsosTagging = function () {
    console.log("Ipsos tag fired");
    // $FlowIgnore
    window.dm = window.dm ||{ AjaxData:[]};
    // $FlowIgnore
    window.dm.AjaxEvent = function(et, d, ssid, ad){
        // $FlowIgnore
        dm.AjaxData.push({ et,d,ssid,ad});
        // $FlowIgnore
        window.DotMetricsObj && DotMetricsObj.onAjaxDataUpdate();
    };
    const d = document;
    const h = d.getElementsByTagName('head')[0];
    const s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = `https://uk-script.dotmetrics.net/door.js?d=${  document.location.host  }&t=${ config.get('page.ipsosTag', '')}`; h.appendChild(s);
};

// Need to change to correct consent vendor
export const init = (): Promise<void> => {
    console.log("Ipsos init");
    onConsentChange(state => {
        console.log(getConsentFor('a9', state));
        if (getConsentFor('a9', state)) {
            IpsosTagging();
        }
    });

    return Promise.resolve();
};
