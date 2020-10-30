// @flow
//import { onConsentChange, getConsentFor } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { loadScript } from '@guardian/libs';

let DotMetricsObj;
let dm;

const IpsosTagging = function () {

    console.debug("Ipsos tag fired");
    window.dm = window.dm ||{ AjaxData:[]};
    window.dm.AjaxEvent = function(et, d, ssid, ad){
        dm.AjaxData.push({ et,d,ssid,ad});
        if (window.DotMetricsObj) {
                DotMetricsObj.onAjaxDataUpdate();
        }
    };
    const ipsosSource = `https://uk-script.dotmetrics.net/door.js?d=${  document.location.host  }&t=${ config.get('page.ipsosTag')}`;

    loadScript(ipsosSource, { id: 'ipsos', async: true, type: 'text/javascript' });
};

// Need to change to correct consent vendor
export const init = (): Promise<void> => {

    // Initial testing only
    if(document.location.href === "https://www.theguardian.com/science/grrlscientist/2012/aug/07/3")
    {
        IpsosTagging();
    }

    /*

    onConsentChange(state => {
        console.log(getConsentFor('5f745ab96f3aae0163740409', state));
        if (getConsentFor('5f745ab96f3aae0163740409', state)) {
            IpsosTagging();
        }
    });

    */

    return Promise.resolve();
};


