define([
    'qwery',
    'bonzo',
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/template',
    'common/utils/config',
    'common/modules/commercial/dfp',
    'text!common/views/badge.html'
], function (
    qwery,
    bonzo,
    defaults,
    once,
    $,
    template,
    globalConfig,
    dfp,
    badgeTpl
) {

    var adBadgeCount = 0,
        spBadgeCount = 0,
        addPreBadge = function ($adSlot, isSponsored, sponsor) {
            if (sponsor) {
                $adSlot.append(template(
                    badgeTpl,
                    {
                        header: isSponsored ? 'Sponsored by:' : 'Brought to you by:',
                        sponsor: sponsor
                    }
                ));
            }
        },
        createAdSlot = function (container, isSponsored, opts) {
            var slotTarget = (isSponsored ? 'sp' : 'ad') + 'badge',
                name       = slotTarget + ((isSponsored) ? ++spBadgeCount : ++adBadgeCount),
                $adSlot    = bonzo(dfp.createAdSlot(
                    name, ['paid-for-badge', 'paid-for-badge--front'], opts.keywords, slotTarget
                ));
            addPreBadge($adSlot, isSponsored, opts.sponsor);
            $('.js-container__header', container)
                .after($adSlot);
            return $adSlot;
        },
        init = function (c) {

            var config = defaults(
                c || {},
                globalConfig,
                {
                    switches: {}
                }
            );

            if (!config.switches.sponsored) {
                return false;
            }

            $('.facia-container--sponsored, .facia-container--advertisement-feature').each(function (faciaContainer) {
                var $faciaContainer = bonzo(faciaContainer);
                createAdSlot(
                    qwery('.container', faciaContainer)[0],
                    $faciaContainer.hasClass('facia-container--sponsored'),
                    { sponsor: $faciaContainer.data('sponsor') }
                );
            });
            $('.container--sponsored, .container--advertisement-feature').each(function (container) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    var $container = bonzo(container);
                    createAdSlot(
                        container,
                        $container.hasClass('container--sponsored'),
                        { keywords: $container.data('keywords'), sponsor: $container.data('sponsor') }
                    );
                }
            });
        },
        badges = {

            init: once(init),

            // add a badge to a container (if appropriate)
            add: function (container) {
                var $adSlot,
                    $container = bonzo(container);
                if (
                    $container.hasClass('container--sponsored') ||
                    $container.hasClass('container--advertisement-feature')
                ) {
                    $adSlot = createAdSlot(
                        container,
                        $container.hasClass('container--sponsored'),
                        { keywords: $container.data('keywords'), sponsor: $container.data('sponsor') }
                    );
                    // add slot to dfp
                    dfp.addSlot($adSlot);
                }
            },

            // really only useful for testing
            reset: function () {
                badges.init = once(init);
                adBadgeCount = spBadgeCount = 0;
            }

        };

    return badges;

});
