import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import {commercialFeatures} from "common/modules/commercial/commercial-features";
import config from 'lib/config';


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

function IpsosTagging() {
    console.log("Ipsos tag fired");
    window.dm = window.dm ||{ AjaxData:[]};
    window.dm.AjaxEvent = function(et, d, ssid, ad){
        dm.AjaxData.push({ et: et,d: d,ssid: ssid,ad: ad});
        window.DotMetricsObj && DotMetricsObj.onAjaxDataUpdate();
    };
    var d = document,
        h = d.getElementsByTagName('head')[0],
        s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://uk-script.dotmetrics.net/door.js?d=' + document.location.host + '&t='+ config.get('page.ipsosTag', ''); h.appendChild(s);
};
