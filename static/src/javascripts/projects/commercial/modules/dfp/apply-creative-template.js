// @flow

import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';

import frame from 'commercial/modules/creatives/frame';
import revealer from 'commercial/modules/creatives/revealer';
import fabric from 'commercial/modules/creatives/fabric-v1';
import fabricExpand from 'commercial/modules/creatives/fabric-expanding-v1';
import fabricExpandVideo
    from 'commercial/modules/creatives/fabric-expandable-video-v2';
import fabricVideo from 'commercial/modules/creatives/fabric-video';
import scrollable from 'commercial/modules/creatives/scrollable-mpu-v2';

const creativeLookup = {
    frame,
    revealer,
    'fabric-v1': fabric,
    'fabric-expanding-v1': fabricExpand,
    'fabric-expandable-video-v2': fabricExpandVideo,
    'fabric-video': fabricVideo,
    'scrollable-mpu-v2': scrollable,
};

const renderCreativeTemplate = (
    adSlot: HTMLElement,
    iFrame: HTMLIFrameElement
) => {
    const fetchCreativeConfig = () => {
        try {
            const breakoutScript = iFrame.contentDocument.body.querySelector(
                '.breakout__script[type="application/json"]'
            );
            return breakoutScript ? breakoutScript.innerHTML : null;
        } catch (err) {
            return null;
        }
    };

    const mergeViewabilityTracker = json => {
        const viewabilityTrackerDiv = iFrame.contentDocument.getElementById(
            'viewabilityTracker'
        );
        const viewabilityTracker = viewabilityTrackerDiv
            ? viewabilityTrackerDiv.childNodes[0].nodeValue.trim()
            : null;

        const updatedJson = Object.assign({}, json);

        if (viewabilityTracker) {
            updatedJson.params.viewabilityTracker = viewabilityTracker;
        }

        return updatedJson;
    };

    const renderCreative = config =>
        new Promise(resolve => {
            const Creative = creativeLookup[config.name];
            resolve(new Creative(adSlot, config.params, config.opts).create());
        });

    const hideIframe = () =>
        fastdom.write(() => {
            /* eslint-disable no-param-reassign */
            iFrame.style.display = 'none';
            /* eslint-enable no-param-reassign */
        });

    const creativeConfig = fetchCreativeConfig();

    if (creativeConfig) {
        return hideIframe()
            .then(() => JSON.parse(creativeConfig))
            .then(mergeViewabilityTracker)
            .then(renderCreative)
            .catch(err =>
                reportError(
                    Error(`Failed to get creative JSON ${err}`),
                    { feature: 'commercial' },
                    false
                )
            );
    }
    return Promise.resolve(true);
};

const getAdvertIframe = adSlot =>
    new Promise((resolve, reject) => {
        // DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
        // We need to be sure only to select the ad content frame.
        const contentFrame = adSlot.querySelector(
            'iframe:not([id*="__hidden__"])'
        );

        if (!contentFrame) {
            reject();
        } else if (
            contentFrame.readyState &&
            contentFrame.readyState !== 'complete'
        ) {
            // On IE, wait for the frame to load before interacting with it
            const getIeIframe = e => {
                const updatedIFrame = e.srcElement;

                if (updatedIFrame && updatedIFrame.readyState === 'complete') {
                    updatedIFrame.removeEventListener(
                        'readystatechange',
                        getIeIframe
                    );
                    resolve(contentFrame);
                }
            };

            contentFrame.addEventListener('readystatechange', getIeIframe);
        } else {
            resolve(contentFrame);
        }
    });

/**
 * Not all adverts render themselves - some just provide data for templates that we implement in commercial.js.
 * This looks for any such data and, if we find it, renders the appropriate component.
 */
const applyCreativeTemplate = (adSlot: HTMLElement) =>
    getAdvertIframe(adSlot).then(iframe =>
        renderCreativeTemplate(adSlot, iframe)
    );

export { applyCreativeTemplate };
