define([
    'fastdom',
    'common/utils/config',
    'common/utils/$',
    'common/utils/ajax-promise'
], function (fastdom, config, $, ajax) {

    var ELEMENT_INITIAL_CLASS = 'element-membership--not-upgraded',
        ELEMENT_UPGRADED_CLASS = 'element-membership--upgraded';

    function upgradeEvent(el) {
        var href = $('a', el).attr('href'),
            matches = (href.indexOf(config.page.membershipUrl) > -1);

        if (matches) {
            ajax({
                url: href + '/card',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.html) {
                    fastdom.write(function () {
                        $(el).html(resp.html)
                            .removeClass(ELEMENT_INITIAL_CLASS)
                            .addClass(ELEMENT_UPGRADED_CLASS);
                    });
                }
            });
        }
    }

    function upgradeEvents() {
        $('.' + ELEMENT_INITIAL_CLASS).each(upgradeEvent);
    }

    return {
        upgradeEvent: upgradeEvent,
        upgradeEvents: upgradeEvents
    };
});
