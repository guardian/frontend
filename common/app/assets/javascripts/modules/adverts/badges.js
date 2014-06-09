define([
    'qwery',
    'bonzo',
    'common/$',
    'common/modules/adverts/dfp',
    'lodash/functions/once'
], function (
    qwery,
    bonzo,
    $,
    dfp,
    once
) {

    var hadSponsoredBadge = false,
        hadAdvertisementFeatureBadge = false,
        createAdSlot = function(container, isSponsored, keywords) {
            if ((isSponsored && hadSponsoredBadge) || (!isSponsored && hadAdvertisementFeatureBadge)) {
                return;
            }
            $('.container__header', container)
                .after(dfp.createAdSlot((isSponsored ? 'sp' : 'ad') + 'badge', ['paid-for-badge', 'paid-for-badge--front'], keywords));
            if (isSponsored) {
                hadSponsoredBadge = true;
            } else {
                hadAdvertisementFeatureBadge = true;
            }
        },
        init = function() {
            $('.facia-container--sponsored, .facia-container--advertisement-feature').each(function(faciaContainer) {
                createAdSlot(
                    qwery('.container', faciaContainer)[0], $(faciaContainer).hasClass('facia-container--sponsored')
                );
            });
            $('.container--sponsored, .container--advertisement-feature').each(function(container) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    createAdSlot(
                        container, $(container).hasClass('container--sponsored'), bonzo(container).data('keywords')
                    );
                }
            });
        },
        badges = {

            init: once(init),

            // really only useful for testing
            reset: function() {
                badges.init = once(init);
                hadSponsoredBadge = false;
                hadAdvertisementFeatureBadge = false;
            }

        };

    return badges;

});
