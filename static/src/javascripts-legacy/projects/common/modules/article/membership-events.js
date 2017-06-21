define(['fastdom', 'lib/$', 'lib/fetch-json', 'lib/report-error'], function(
    fastdom,
    $,
    fetchJson,
    reportError
) {
    var ELEMENT_INITIAL_CLASS = 'element-membership--not-upgraded',
        ELEMENT_UPGRADED_CLASS = 'element-membership--upgraded';

    function upgradeEvent(el) {
        var href = $('a', el).attr('href'),
            matches = href.match(/https:\/\/membership.theguardian.com/);

        if (matches) {
            fetchJson(href + '/card', {
                mode: 'cors',
            })
                .then(function(resp) {
                    if (resp.html) {
                        fastdom.write(function() {
                            $(el)
                                .html(resp.html)
                                .removeClass(ELEMENT_INITIAL_CLASS)
                                .addClass(ELEMENT_UPGRADED_CLASS);
                        });
                    }
                })
                .catch(function(ex) {
                    reportError(ex, {
                        feature: 'membership-events',
                    });
                });
        }
    }

    function upgradeEvents() {
        $('.' + ELEMENT_INITIAL_CLASS).each(upgradeEvent);
    }

    return {
        upgradeEvent: upgradeEvent,
        upgradeEvents: upgradeEvents,
    };
});
