define([
    'qwery',
    'Promise',
    'common/utils/fastdom-promise',

    // These need to be bundled, so that they can be fetched asynchronously in production
    'common/modules/commercial/creatives/commercial-component',
    'common/modules/commercial/creatives/gu-style-comcontent',
    'common/modules/commercial/creatives/frame',
    'common/modules/commercial/creatives/facebook',
    'common/modules/commercial/creatives/expandable',
    'common/modules/commercial/creatives/expandable-v2',
    'common/modules/commercial/creatives/expandable-v3',
    'common/modules/commercial/creatives/expandable-video',
    'common/modules/commercial/creatives/expandable-video-v2',
    'common/modules/commercial/creatives/fabric-v1',
    'common/modules/commercial/creatives/fabric-expanding-v1',
    'common/modules/commercial/creatives/fabric-expandable-video-v1',
    'common/modules/commercial/creatives/fluid250',
    'common/modules/commercial/creatives/fluid250GoogleAndroid',
    'common/modules/commercial/creatives/hosted-thrasher',
    'common/modules/commercial/creatives/hosted-thrasher-multi',
    'common/modules/commercial/creatives/scrollable-mpu',
    'common/modules/commercial/creatives/scrollable-mpu-v2',
    'common/modules/commercial/creatives/template'
], function (
    qwery,
    Promise,
    fastdom
) {
    /**
     * Not all adverts render themselves - some just provide data for templates that we implement in commercial.js.
     * This looks for any such data and, if we find it, renders the appropriate component.
     */
    return function applyCreativeTemplate($adSlot) {
        return getAdvertIframe($adSlot).then(function (iframe) {
            return renderCreativeTemplate($adSlot, iframe);
        });
    };

    function getAdvertIframe($adSlot) {
        return new Promise(function (resolve, reject) {
            var iframes = qwery('iframe', $adSlot);
            var nonEmptyFrames = iframes.filter(function (iframe) {
                // DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
                // These never reach 'complete' state in IE, so we filter them.
                return iframe.id.match('__hidden__') === null;
            });
            var contentFrame = nonEmptyFrames[0];

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

    function renderCreativeTemplate($adSlot, iFrame) {
        var creativeConfig = fetchCreativeConfig();

        if (creativeConfig) {
            return Promise.all([
                renderCreative(creativeConfig),
                hideIframe()
            ]);
        } else {
            return Promise.resolve();
        }

        function fetchCreativeConfig() {
            var breakoutScript = iFrame.contentDocument.body.querySelector('.breakout__script[type="application/json"]');
            return breakoutScript ? JSON.parse(breakoutScript.innerHTML) : null;
        }

        function renderCreative(config) {
            if (config.name === 'fluid250-v4' || config.name === 'fluid250-v3') {
                config.name = 'fluid250';
            } else if (config.name === 'foundation-funded-logo') {
                config.name = 'template';
                config.params.creative = 'logo';
                config.params.type = 'funded';
            }

            return new Promise(function(resolve) {
                require(['common/modules/commercial/creatives/' + config.name], function (Creative) {
                    resolve(new Creative($adSlot, config.params, config.opts).create());
                });
            });
        }

        function hideIframe() {
            return fastdom.write(function () {
                iFrame.style.display = 'none';
            });
        }
    }

});
