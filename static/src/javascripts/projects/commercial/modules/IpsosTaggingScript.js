// @flow
import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import config from 'lib/config';

// $FlowIssue[func-style]
function IpsosTagging() {
    console.log("Ipsos tag fired");
    window.dm = window.dm ||{ AjaxData:[]};
    // $FlowFixMe
    window.dm.AjaxEvent = function(et, d, ssid, ad){
        // $FlowFixMe
        // $FlowFixMe[no-undef]
        // $FlowFixMe[prefer-const]
        dm.AjaxData.push({ et,d,ssid,ad});
        // $FlowFixMe[no-undef]
        window.DotMetricsObj && DotMetricsObj.onAjaxDataUpdate();
    };
    let d = document,
        h = d.getElementsByTagName('head')[0],
        s = d.createElement('script');
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
