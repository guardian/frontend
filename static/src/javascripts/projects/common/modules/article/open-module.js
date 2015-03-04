define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/article/spacefinder'
], function (
    $,
    ajax,
    config,
    detect,
    spacefinder
) {

    function getSpacefinderRules() {
        return {
            minAbove: 200,
            minBelow: 250,
            selectors: {
                ' > h2': {minAbove: detect.getBreakpoint() === 'mobile' ? 20 : 0, minBelow: 200},
                ' > *:not(p):not(h2)': {minAbove: 35, minBelow: 300},
                ' .ad-slot': {minAbove: 150, minBelow: 200},
                ' .element-rich-link': {minAbove: 400, minBelow: 400}
            }
        };
    }

    return {
        init: function () {
            if (config.page.openModule) {
                spacefinder.getParaWithSpace(getSpacefinderRules()).then(function (space) {
                    if (space) {
                        ajax({
                            url: config.page.openModule,
                            crossOrigin: true,
                            method: 'get'
                        }).then(function (resp) {
                            if (resp.html) {
                                fastdom.write(function () {
                                    $.create(resp.html)
                                        .addClass('element--supporting')
                                        .insertBefore(space);
                                    $('.submeta-container--break').removeClass('submeta-container--break');
                                });
                            }
                        });
                    }
                });
            }
        }
    };
});
