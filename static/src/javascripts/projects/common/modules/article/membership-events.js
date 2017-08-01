import fastdom from 'fastdom';
import $ from 'lib/$';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';

var ELEMENT_INITIAL_CLASS = 'element-membership--not-upgraded',
    ELEMENT_UPGRADED_CLASS = 'element-membership--upgraded';

function upgradeEvent(el) {
    var href = $('a', el).attr('href'),
        matches = href.match(/https:\/\/membership.theguardian.com/);

    if (matches) {
        fetchJson(href + '/card', {
                mode: 'cors'
            }).then(function(resp) {
                if (resp.html) {
                    fastdom.write(function() {
                        $(el).html(resp.html)
                            .removeClass(ELEMENT_INITIAL_CLASS)
                            .addClass(ELEMENT_UPGRADED_CLASS);
                    });
                }
            })
            .catch(function(ex) {
                reportError(ex, {
                    feature: 'membership-events'
                });
            });
    }
}

function upgradeEvents() {
    $('.' + ELEMENT_INITIAL_CLASS).each(upgradeEvent);
}

export default {
    upgradeEvent: upgradeEvent,
    upgradeEvents: upgradeEvents
};
