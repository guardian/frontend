// @flow

import { write } from 'lib/fastdom-promise';
import reportError from 'lib/report-error';

import a from 'commercial/modules/creatives/frame',
import b from 'commercial/modules/creatives/revealer',
import c from 'commercial/modules/creatives/fabric-v1',
import d from 'commercial/modules/creatives/fabric-expanding-v1',
import e from 'commercial/modules/creatives/fabric-expandable-video-v2',
import f from 'commercial/modules/creatives/fabric-video',
import g from 'commercial/modules/creatives/scrollable-mpu-v2'

const creativeLookup = {
  frame: a,
  revealer: b,
  'fabric-v1': c,
  'fabric-expanding-v1': d,
  'fabric-expandable-video-v2': e,
  'fabric-video': f,
  'scrollable-mpu-v2': g
}

/**
 * Not all adverts render themselves - some just provide data for templates that we implement in commercial.js.
 * This looks for any such data and, if we find it, renders the appropriate component.
 */
const applyCreativeTemplate = adSlot =>
    getAdvertIframe(adSlot).then( iframe => renderCreativeTemplate(adSlot, iframe));

const getAdvertIframe = adSlot => {
    return new Promise( (resolve, reject) => {
        // DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
        // We need to be sure only to select the ad content frame.
        const contentFrame = adSlot.querySelector('iframe:not([id*="__hidden__"])');

        if (!contentFrame) {
            reject();
        }
        // On IE, wait for the frame to load before interacting with it
        else if (contentFrame.readyState && contentFrame.readyState !== 'complete') {
            contentFrame.addEventListener('readystatechange', e => {
                const updatedIFrame = e.srcElement;

                if (
                    /*eslint-disable valid-typeof*/
                updatedIFrame &&
                typeof updatedIFrame.readyState !== 'unknown' &&
                updatedIFrame.readyState === 'complete'
                /*eslint-enable valid-typeof*/
                ) {
                    updatedIFrame.removeEventListener('readystatechange', onRSC);
                    resolve(contentFrame);
                }
            });
        } else {
            resolve(contentFrame);
        }
    });
}

const renderCreativeTemplate = (adSlot, iFrame) => {

    const fetchCreativeConfig = () => {
        try {
            const breakoutScript = iFrame.contentDocument.body.querySelector('.breakout__script[type="application/json"]');
            return breakoutScript ? breakoutScript.innerHTML : null;
        } catch (err) {
            return null;
        }
    }

    const mergeViewabilityTracker = json => {
        const viewabilityTrackerDiv = iFrame.contentDocument.getElementById('viewabilityTracker');
        const viewabilityTracker = viewabilityTrackerDiv ?
            viewabilityTrackerDiv.childNodes[0].nodeValue.trim() :
            null;
        if (viewabilityTracker) {
            json.params.viewabilityTracker = viewabilityTracker;
        }
        return json;
    }

    const renderCreative = config => {
        return new Promise(function(resolve) {
          const Creative = creativeLookup[config.name];
          resolve(new Creative(adSlot, config.params, config.opts).create());
        });
    }

    const hideIframe = () => {
        return write(function () {
            iFrame.style.display = 'none';
            return creativeConfig;
        });
    }

    const creativeConfig = fetchCreativeConfig();

    if (creativeConfig) {
        return hideIframe()
            .then(JSON.parse)
            .then(mergeViewabilityTracker)
            .then(renderCreative)
            .catch(err =>
              reportError(`Failed to get creative JSON ${err}`,
                          {feature: 'commercial'},
                          false));
    } else {
        return Promise.resolve(true);
    }
}
export default applyCreativeTemplate;
