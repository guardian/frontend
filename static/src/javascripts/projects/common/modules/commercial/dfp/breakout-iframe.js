define([
    'bonzo',
    'Promise',
    'common/utils/fastdom-promise',

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
    'common/modules/commercial/creatives/scrollable-mpu',
    'common/modules/commercial/creatives/scrollable-mpu-v2',
    'common/modules/commercial/creatives/template'
], function (
    bonzo,
    Promise,
    fastdom
) {

    /**
     * Allows ad content to break out of their iframes. The ad's content must have one of the above breakoutClasses.
     * This can be set on the DFP creative.
     */
    function breakoutIFrame(iFrame, slot) {
        /*eslint-disable no-eval*/
        var iFrameBody = iFrame.contentDocument;
        var breakoutEl = iFrameBody.querySelector('.breakout__html, .breakout__script');

        if (!breakoutEl) {
            return Promise.resolve(true);
        } else if (breakoutEl.classList.contains('breakout__html')) {
            return fastdom.write(function () {
                iFrame.setAttribute('hidden', 'hidden');
                breakoutEl.parentNode.removeChild(breakoutEl);
                slot.insertAdjacentHTML('beforeend', breakoutEl.innerHTML);
                return true;
            });
        } else if (breakoutEl.classList.contains('breakout__script')) {
            return fastdom.write(function () {
                iFrame.setAttribute('hidden', 'hidden');
            }).then(function () {
                var breakoutContent = breakoutEl.innerHTML;
                if (breakoutEl.type === 'application/json') {
                    var creativeConfig = JSON.parse(breakoutContent);
                    return new Promise(function(resolve) {
                        require(['common/modules/commercial/creatives/' + creativeConfig.name], function (Creative) {
                            resolve(new Creative(bonzo(slot), creativeConfig.params, creativeConfig.opts).create());
                        });
                    });
                } else {
                    // evil, but we own the returning js snippet
                    eval(breakoutContent);
                    return true;
                }
            });
        }
    }

    return breakoutIFrame;

});
