import fastdom from 'fastdom';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import template from 'lodash/utilities/template';
import fastdomPromise from 'lib/fastdom-promise';
import spaceFiller from 'common/modules/article/space-filler';
import richLinkTagTmpl from 'raw-loader!common/views/content/richLinkTag.html';
import contains from 'lodash/collections/contains';
import 'common/modules/experiments/ab';

function elementIsBelowViewport(el) {
    return fastdomPromise.read(function() {
        var rect = el.getBoundingClientRect();
        return rect.top > (window.innerHeight || document.documentElement.clientHeight);
    });
}

function upgradeRichLink(el) {
    var href = $('a', el).attr('href');
    var matches = href.match(/(?:^https?:\/\/(?:www\.|m\.code\.dev-)theguardian\.com)?(\/.*)/);
    var isOnMobile = detect.isBreakpoint({
        max: 'mobileLandscape'
    });

    function doUpgrade(shouldUpgrade, resp) {
        if (shouldUpgrade) {
            return fastdom.write(function() {
                $(el).html(resp.html)
                    .removeClass('element-rich-link--not-upgraded')
                    .addClass('element-rich-link--upgraded');
                $('.submeta-container--break').removeClass('submeta-container--break');
                mediator.emit('rich-link:loaded', el);
            });
        }
    }

    if (matches && matches[1]) {
        return fetchJson('/embed/card' + matches[1] + '.json', {
                mode: 'cors'
            }).then(function(resp) {
                if (resp.html) {

                    // Fastdom read the viewport height before upgrading if on mobile
                    if (isOnMobile) {
                        elementIsBelowViewport(el).then(function(shouldUpgrade) {
                            doUpgrade(shouldUpgrade, resp);
                        });
                    } else {
                        doUpgrade(true, resp);
                    }
                }
            })
            .catch(function(ex) {
                reportError(ex, {
                    feature: 'rich-links'
                });
            });
    } else {
        return Promise.resolve(null);
    }

}

function getSpacefinderRules() {
    return {
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
        minAbove: 200,
        minBelow: 250,
        clearContentMeta: 50,
        selectors: {
            ' > h2': {
                minAbove: detect.getBreakpoint() === 'mobile' ? 20 : 0,
                minBelow: 200
            },
            ' > *:not(p):not(h2):not(blockquote)': {
                minAbove: 35,
                minBelow: 300
            },
            ' .ad-slot': {
                minAbove: 150,
                minBelow: 200
            },
            ' .element-rich-link': {
                minAbove: 500,
                minBelow: 500
            }
        }
    };
}

function insertTagRichLink() {
    var $insertedEl,
        richLinkHrefs = $('.element-rich-link a')
        .map(function(el) {
            return $(el).attr('href');
        }),
        testIfDuplicate = function(richLinkHref) {
            // Tag-targeted rich links can be absolute
            return contains(config.page.richLink, richLinkHref);
        },
        isDuplicate = richLinkHrefs.some(testIfDuplicate),
        isSensitive = config.page.shouldHideAdverts || !config.page.showRelatedContent;

    if (config.page.richLink &&
        config.page.richLink.indexOf(config.page.pageId) === -1 &&
        !isSensitive &&
        !isDuplicate
    ) {
        return spaceFiller.spaceFiller.fillSpace(getSpacefinderRules(), function(paras) {
            $insertedEl = $.create(template(richLinkTagTmpl, {
                href: config.page.richLink
            }));
            $insertedEl.insertBefore(paras[0]);
            return $insertedEl[0];
        }, {
            waitForAds: true
        }).then(function(didInsert) {
            if (didInsert) {
                return Promise.resolve(upgradeRichLink($insertedEl[0]));
            } else {
                return Promise.resolve(null);
            }
        });
    } else {
        return Promise.resolve(null);
    }
}

function upgradeRichLinks() {
    $('.element-rich-link--not-upgraded').each(upgradeRichLink);
}

export default {
    upgradeRichLinks: upgradeRichLinks,
    insertTagRichLink: insertTagRichLink,
    getSpacefinderRules: getSpacefinderRules
};
