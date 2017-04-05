define([
    'fastdom',
    'lib/$',
    'lib/fetch',
    'lib/config',
    'lib/detect',
    'common/modules/article/space-filler'
], function (
    fastdom,
    $,
    fetch,
    config,
    detect,
    spaceFiller
) {

    function getSpacefinderRules() {
        return {
            bodySelector: '.js-article__body',
            slotSelector: ' > p',
            minAbove: 200,
            minBelow: 250,
            clearContentMeta: 50,
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
                spaceFiller.fillSpace(getSpacefinderRules(), function (spaces) {
                    fetch(config.page.openModule, {
                        mode: 'cors',
                    }).then(function (resp) {
                        var body = resp && resp.text();

                        if (body) {
                            fastdom.write(function () {
                                $.create(body)
                                    .addClass('element--supporting')
                                    .insertBefore(spaces[0]);
                                $('.submeta-container--break').removeClass('submeta-container--break');
                            });
                        }
                    });
                });
            }
        }
    };
});
