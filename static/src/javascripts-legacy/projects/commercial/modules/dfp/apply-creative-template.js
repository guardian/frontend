define([
    'Promise',
    'lib/fastdom-promise',
    'lib/report-error',

    // These need to be bundled, so that they can be fetched asynchronously in production
    'commercial/modules/creatives/frame',
    'commercial/modules/creatives/revealer',
    'commercial/modules/creatives/fabric-v1',
    'commercial/modules/creatives/fabric-expanding-v1',
    'commercial/modules/creatives/fabric-expandable-video-v2',
    'commercial/modules/creatives/fabric-video',
    'commercial/modules/creatives/scrollable-mpu-v2'
], function (
    Promise,
    fastdom,
    reportError
) {
    /**
     * Not all adverts render themselves - some just provide data for templates that we implement in commercial.js.
     * This looks for any such data and, if we find it, renders the appropriate component.
     */
    return function applyCreativeTemplate(adSlot) {
        return getAdvertIframe(adSlot).then(function (iframe) {
            return renderCreativeTemplate(adSlot, iframe);
        });
    };

    function getAdvertIframe(adSlot) {
        return new Promise(function (resolve, reject) {
            // DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
            // We need to be sure only to select the ad content frame.
            var contentFrame = adSlot.querySelector('iframe:not([id*="__hidden__"])');

            if (!contentFrame) {
                reject();
            }
            // On IE, wait for the frame to load before interacting with it
            else if (contentFrame.readyState && contentFrame.readyState !== 'complete') {
                contentFrame.addEventListener('readystatechange', function onRSC(e) {
                    var updatedIFrame = e.srcElement;

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

    function renderCreativeTemplate(adSlot, iFrame) {
        var creativeConfig = fetchCreativeConfig();

        if (creativeConfig) {
            return hideIframe()
                .then(JSON.parse)
                .then(mergeViewabilityTracker)
                .then(renderCreative)
                .catch(function (err) {
                  reportError('Failed to get creative JSON ' + err, {feature: 'commercial'}, false);
                });
        } else {
            return Promise.resolve(true);
        }

        function fetchCreativeConfig() {
            try {
                var breakoutScript = iFrame.contentDocument.body.querySelector('.breakout__script[type="application/json"]');
                return breakoutScript ? breakoutScript.innerHTML : null;
            } catch (err) {
                return null;
            }

        }

        function mergeViewabilityTracker(json) {
            var viewabilityTrackerDiv = iFrame.contentDocument.getElementById('viewabilityTracker');
            var viewabilityTracker = viewabilityTrackerDiv ?
                viewabilityTrackerDiv.childNodes[0].nodeValue.trim() :
                null;
            if (viewabilityTracker) {
                json.params.viewabilityTracker = viewabilityTracker;
            }
            return json;
        }

        function renderCreative(config) {
            return new Promise(function(resolve) {
                require(['commercial/modules/creatives/' + config.name], function (Creative) {
                    resolve(new Creative(adSlot, config.params, config.opts).create());
                });
            });
        }

        function hideIframe() {
            return fastdom.write(function () {
                iFrame.style.display = 'none';
                return creativeConfig;
            });
        }
    }

});
