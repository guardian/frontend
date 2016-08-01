define([
    'common/utils/fastdom-promise',
    'common/utils/report-error'
], function (
    fastdom,
    reportError
) {
    var RECOMMENDATION_CLASS = 'js-recommend-comment';
    var TOOLTIP_CLASS = 'js-rec-tooltip';
    var HIDE_TOOLTIP_CLASS = 'tooltip-box-hidden';

    function handle (target, container, user, discussionApi) {
        if (!user) {
            return showSignInTooltip(target);
        } else if (isOpenForRecommendations(container)) {
            var id = target.getAttribute('data-comment-id');

            return Promise.all([
                setClicked(target),
                discussionApi.recommendComment(id)
            ])
            .then(function () {
                return setRecommended(target);
            })
            .catch(function (ex) {
                unsetClicked(target);
                reportError(ex, {
                    feature: 'comments-recommend'
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
        return fastdom.write(function () {
            tooltip.classList.remove(HIDE_TOOLTIP_CLASS);
            target.appendChild(tooltip);
        });
    }

    function closeTooltip () {
        return fastdom.write(function () {
            document.querySelector('.' + TOOLTIP_CLASS).classList.add(HIDE_TOOLTIP_CLASS);
        });
    }

    return {
        handle: handle,
        closeTooltip: closeTooltip
    };
});
