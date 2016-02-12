define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-idle',
    'lodash/collections/forEach'
], function (
    bonzo,
    $,
    config,
    idleFastdom,
    forEach
) {
    var breakoutClasses = [
        'breakout__html',
        'breakout__script'
    ];

    /**
     * Allows ad content to break out of their iframes. The ad's content must have one of the above breakoutClasses.
     * This can be set on the DFP creative.
     */
    function breakoutIFrame(iFrame, $slot) {
        /*eslint-disable no-eval*/
        var shouldRemoveIFrame = false,
            $iFrame            = bonzo(iFrame),
            iFrameBody         = iFrame.contentDocument.body,
            $iFrameParent      = $iFrame.parent(),
            type               = {};

        if (iFrameBody) {
            forEach(breakoutClasses, function (breakoutClass) {
                $('.' + breakoutClass, iFrameBody).each(function (breakoutEl) {
                    var creativeConfig,
                        $breakoutEl     = bonzo(breakoutEl),
                        breakoutContent = $breakoutEl.html();

                    if (breakoutClass === 'breakout__script') {
                        // new way of passing data from DFP
                        if ($breakoutEl.attr('type') === 'application/json') {
                            creativeConfig = JSON.parse(breakoutContent);
                            require(['common/modules/commercial/creatives/' + creativeConfig.name], function (Creative) {
                                new Creative($slot, creativeConfig.params, creativeConfig.opts).create();
                            });
                        } else {
                            // evil, but we own the returning js snippet
                            eval(breakoutContent);
                        }

                        type = {
                            type: creativeConfig.params.adType || '',
                            variant: creativeConfig.params.adVariant || ''
                        };

                    } else {
                        idleFastdom.write(function () {
                            $iFrameParent.append(breakoutContent);
                            $breakoutEl.remove();
                        });

                        $('.ad--responsive', $iFrameParent[0]).each(function (responsiveAd) {
                            window.setTimeout(function () {
                                idleFastdom.write(function () {
                                    bonzo(responsiveAd).addClass('ad--responsive--open');
                                });
                            }, 50);
                        });
                    }
                    shouldRemoveIFrame = true;
                });
            });
        }
        if (shouldRemoveIFrame) {
            idleFastdom.write(function () {
                $iFrame.hide();
            });
        }

        return type;
    }

    return breakoutIFrame;

});
