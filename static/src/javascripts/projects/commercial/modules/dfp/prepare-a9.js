// @flow

import config from 'lib/config';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { buildPageTargeting } from 'common/modules/commercial/build-page-targeting';
import once from 'lodash/once';
import a9 from 'commercial/modules/prebid/a9';

const isGoogleProxy: () => boolean = () =>
    !!(
        navigator &&
        navigator.userAgent &&
        (navigator.userAgent.indexOf('Google Web Preview') > -1 ||
            navigator.userAgent.indexOf('googleweblight') > -1)
    );

let moduleLoadResult = Promise.resolve();


if (!isGoogleProxy()) {
    moduleLoadResult = new Promise(resolve => {
        !function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");
        resolve();
    });
}

const setupA9: () => Promise<void> = () =>
    moduleLoadResult.then(() => {
        if (
            //dfpEnv.externalDemand === 'a9' &&
            commercialFeatures.dfpAdvertising &&
            !commercialFeatures.adFree &&
            !config.get('page.hasPageSkin') &&
            !isGoogleProxy()
        ) {
            buildPageTargeting();
            a9.initialise(window);
        }
        return Promise.resolve();
    });

export const setupA9Once: () => Promise<void> = once(setupA9);

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();
    setupA9Once().then(stop);
    return Promise.resolve();
};

export const _ = {
    isGoogleProxy,
    setupA9,
};
