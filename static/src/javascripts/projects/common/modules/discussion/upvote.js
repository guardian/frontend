define([
    'lodash/objects/assign',
    'lib/fastdom-promise',
    'lib/report-error',
    'lib/url'
], function (
    assign,
    fastdom,
    reportError,
    urlUtil
) {
    var RECOMMENDATION_CLASS = 'js-recommend-comment';
    var TOOLTIP_CLASS = 'js-rec-tooltip';

    function handle (target, container, user, discussionApi, allowAnonymousRecommends) {
        if (!allowAnonymousRecommends && !user) {
            target.setAttribute('data-link-name', 'Recommend comment anonymous');
            return showSignInTooltip(target);
        } else if ((allowAnonymousRecommends || user) && isOpenForRecommendations(container)) {
            var id = target.getAttribute('data-comment-id');

            return Promise.all([
                setClicked(target),
                discussionApi.recommendComment(id)
            ])
            .then(function () {
                return setRecommended(target);
            })
            .catch(function (ex) {
                return unsetClicked(target).then(function() {
                    reportError(ex, {
                        feature: 'comments-recommend'
                    });
                });
            });
        }
    }

    function isOpenForRecommendations (element) {
        return !!element.querySelector('.d-discussion--recommendations-open');
    }

    function setClicked (target) {
        return fastdom.write(function () {
            target.classList.remove(RECOMMENDATION_CLASS);
            target.classList.add('d-comment__recommend--clicked');
        });
    }

    function unsetClicked (target) {
        return fastdom.write(function () {
            target.classList.add(RECOMMENDATION_CLASS);
            target.classList.remove('d-comment__recommend--clicked');
        });
    }

    function setRecommended (target) {
        return fastdom.write(function () {
            target.classList.add('d-comment__recommend--recommended');
        });
    }

    function showSignInTooltip (target) {
        var tooltip = document.querySelector('.' + TOOLTIP_CLASS);
        var links = tooltip.querySelectorAll('.js-rec-tooltip-link');

        return fastdom.write(function () {
            updateReturnUrl(links, target.getAttribute('data-comment-url'));
            tooltip.removeAttribute('hidden');
            target.appendChild(tooltip);
        });
    }

    function updateReturnUrl (links, returnLink) {
        for (var i = 0, len = links.length; i < len; i += 1) {
            var url = links[i].getAttribute('href');
            var baseUrl = url.split('?')[0];
            var query = urlUtil.getUrlVars(url.split('?')[1] || '&');
            links[i].setAttribute('href', baseUrl + '?' + urlUtil.constructQuery(assign(query, {
                returnUrl: returnLink
            })));
        }
    }

    function closeTooltip () {
        return fastdom.write(function () {
            document.querySelector('.' + TOOLTIP_CLASS).setAttribute('hidden', '');
        });
    }

    return {
        handle: handle,
        closeTooltip: closeTooltip
    };
});
