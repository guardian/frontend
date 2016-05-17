define([
    'bonzo',
    'Promise',
    'common/utils/$',
    'common/utils/config',
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
    'common/modules/commercial/creatives/scrollable-mpu',
    'common/modules/commercial/creatives/scrollable-mpu-v2',
    'common/modules/commercial/creatives/template'
], function (
    bonzo,
    Promise,
    $,
    config,
    fastdom
) {

    /**
     * Allows ad content to break out of their iframes. The ad's content must have one of the above breakoutClasses.
     * This can be set on the DFP creative.
     */
    function breakoutIFrame(iFrame, $slot) {
        /*eslint-disable no-eval*/
        var $iFrame = bonzo(iFrame);
        var iFrameBody = iFrame.contentDocument.body;
        var $breakoutEl;

        $breakoutEl = $('.breakout__html, .breakout__script', iFrameBody);

        if ($breakoutEl.hasClass('breakout__html')) {
            return fastdom.write(function () {
                $iFrame.hide();
                $breakoutEl.detach();
                $slot.append($breakoutEl[0].innerHTML);
            });
        } else if ($breakoutEl.hasClass('breakout__script')) {
            return fastdom.write(function () {
                $iFrame.hide();
            }).then(function () {
                var breakoutContent = $breakoutEl.html();
                if ($breakoutEl.attr('type') === 'application/json') {
                    var creativeConfig = JSON.parse(breakoutContent);
                    if (creativeConfig.name === 'fluid250-v4' || creativeConfig.name === 'fluid250-v3') {
                        creativeConfig.name = 'fluid250';
                    } else if (creativeConfig.name === 'foundation-funded-logo') {
                        creativeConfig.name = 'template';
                        creativeConfig.params.creative = 'logo';
                        creativeConfig.params.type = 'funded';
                    }
                    return new Promise(function(resolve) {
                        require(['common/modules/commercial/creatives/' + creativeConfig.name], function (Creative) {
                            resolve(new Creative($slot, creativeConfig.params, creativeConfig.opts).create());
                        });
                    });
                } else {
                    // evil, but we own the returning js snippet
                    eval(breakoutContent);
                }
            });
        }
    }

    return breakoutIFrame;

});
