define([
    'qwery',
    'bonzo',
    'common/utils/$',
    'common/modules/commercial/dfp',
    'lodash/functions/once',
    'common/utils/template'
], function (
    qwery,
    bonzo,
    $,
    dfp,
    once,
    template
) {

    var hadSponsoredBadge = false,
        hadAdvertisementFeatureBadge = false,
        addPreBadge = function($adSlot, isSponsored, sponsor) {
            if (sponsor) {
                var html = bonzo.create(template(
                    '<div class="ad-slot--paid-for-badge__inner">' +
                        '<h3 class="ad-slot--paid-for-badge__header">{{header}}</h3>' +
                        '<p class="ad-slot--paid-for-badge__header">{{sponsor}}</p>' +
                    '</div>',
                    {
                        header: isSponsored ? 'Sponsored by:' : 'Advertisement feature',
                        sponsor: sponsor
                    }
                ))[0];
                if (!isSponsored) {
                    $('.ad-slot--paid-for-badge__header', html).first()
                        .after('<p class="ad-slot--paid-for-badge__label">in association with</p>')
                }
                $adSlot.append(html)
            }
        },
        createAdSlot = function(container, isSponsored, opts) {
            if ((isSponsored && hadSponsoredBadge) || (!isSponsored && hadAdvertisementFeatureBadge)) {
                return;
            }
            var $adSlot = bonzo(dfp.createAdSlot(
                (isSponsored ? 'sp' : 'ad') + 'badge', ['paid-for-badge', 'paid-for-badge--front'], opts.keywords
            ));
            if (isSponsored) {
                addPreBadge($adSlot, true, opts.sponsor);
                hadSponsoredBadge = true;
            } else {
                addPreBadge($adSlot, false, opts.sponsor);
                hadAdvertisementFeatureBadge = true;
            }
            $('.container__header', container)
                .after($adSlot);
        },
        init = function() {
            $('.facia-container--sponsored, .facia-container--advertisement-feature').each(function(faciaContainer) {
                var $faciaContainer = bonzo(faciaContainer);
                createAdSlot(
                    qwery('.container', faciaContainer)[0],
                    $faciaContainer.hasClass('facia-container--sponsored'),
                    { sponsor: $faciaContainer.data('sponsor') }
                );
            });
            $('.container--sponsored, .container--advertisement-feature').each(function(container) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    var $container = bonzo(container);
                    createAdSlot(
                        container,
                        bonzo(container).hasClass('container--sponsored'),
                        { keywords: $container.data('keywords'), sponsor: $container.data('sponsor') }
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
