define([
    'qwery',
    'common/$',
    'common/modules/adverts/dfp',
    'lodash/functions/once'
], function (
    qwery,
    $,
    dfp,
    once
) {

    var hadSponsoredBadge = false,
        hadAdvertisementFeatureBadge = false,
        createAdSlot = function(container, isSponsored) {
            if ((isSponsored && hadSponsoredBadge) || (!isSponsored && hadAdvertisementFeatureBadge)) {
                return;
            }
            console.log($('.container__header', container));
            $('.container__header', container)
                .after(dfp.createAdSlot((isSponsored ? 'sp' : 'ad') + 'badge', 'paid-for-badge'));
            if (isSponsored) {
                hadSponsoredBadge = true;
            } else {
                hadAdvertisementFeatureBadge = true;
            }
        };

    return {

        init: once(function() {
            $('.facia-container--sponsored, .facia-container--advertisement-feature').each(function(faciaContainer) {
                createAdSlot(qwery('.container', faciaContainer)[0], $(faciaContainer).hasClass('facia-container--sponsored'));
            });
            $('.container--sponsored, .container--advertisement-feature').each(function(container) {
                if (qwery('.paid-for-badge', container).length === 0) {
                    createAdSlot(container, $(container).hasClass('container--sponsored'));
                }
            });
        })

    };

});
