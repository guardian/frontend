define([
    'bean',
    'bonzo',
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/report-error',

    // These need to be bundled, so that they can be fetched asynchronously in production
    'commercial/modules/creatives/commercial-component',
    'commercial/modules/creatives/gu-style-comcontent',
    'commercial/modules/creatives/frame',
    'commercial/modules/creatives/revealer',
    'commercial/modules/creatives/fabric-v1',
    'commercial/modules/creatives/fabric-expanding-v1',
    'commercial/modules/creatives/fabric-expandable-video-v1',
    'commercial/modules/creatives/fabric-expandable-video-v2',
    'commercial/modules/creatives/fabric-video',
    'commercial/modules/creatives/fluid250',
    'commercial/modules/creatives/fluid250GoogleAndroid',
    'commercial/modules/creatives/hosted-thrasher-multi',
    'commercial/modules/creatives/scrollable-mpu',
    'commercial/modules/creatives/scrollable-mpu-v2',
    'commercial/modules/creatives/template'
], function (
    bean,
    bonzo,
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
                bean.on(contentFrame, 'readystatechange', function (e) {
                    var updatedIFrame = e.srcElement;

                    if (
                        /*eslint-disable valid-typeof*/
                    updatedIFrame &&
                    typeof updatedIFrame.readyState !== 'unknown' &&
                    updatedIFrame.readyState === 'complete'
                    /*eslint-enable valid-typeof*/
                    ) {
                        bean.off(updatedIFrame, 'readystatechange');
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
                .then(renderCreative)
                .catch(function (err) {
                reportError('Failed to get creative JSON ' + err);
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

        function renderCreative(config) {
            return new Promise(function(resolve) {
                require(['commercial/modules/creatives/' + config.name], function (Creative) {
                    resolve(new Creative(bonzo(adSlot), config.params, config.opts).create());
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
