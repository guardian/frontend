define([
    'qwery',
    'bonzo',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/modules/commercial/dfp',
    'text!common/views/commercial/badge.html'
], function (
    qwery,
    bonzo,
    once,
    $,
    config,
    template,
    dfp,
    badgeTpl
) {

    var badgesConfig = {
            sponsored: {
                count     : 0,
                header    : 'Sponsored by:',
                namePrefix: 'sp'
            },
            'advertisement-feature': {
                count     : 0,
                header    : 'Brought to you by:',
                namePrefix: 'ad'
            },
            'foundation-supported': { }
        },
        addPreBadge  = function ($adSlot, header, sponsor) {
            if (sponsor) {
                $adSlot.append(template(
                    badgeTpl,
                    {
                        header:  header,
                        sponsor: sponsor
                    }
                ));
            }
        },
        createAdSlot = function (container, sponsorship, opts) {
            var badgeConfig = badgesConfig[sponsorship],
                slotTarget  = badgeConfig.namePrefix + 'badge',
                name        = slotTarget + (++badgeConfig.count),
                $adSlot     = bonzo(dfp.createAdSlot(
                    name, ['paid-for-badge', 'paid-for-badge--front'], opts.keywords, slotTarget
                ));

            addPreBadge($adSlot, badgeConfig.header, opts.sponsor);
            $('.js-container__header', container)
                .after($adSlot);

            return $adSlot;
        },
        init = function () {

            if (!config.switches.sponsored) {
                return false;
            }

            $('.js-sponsored-front').each(function (faciaContainer) {
                var $faciaContainer = bonzo(faciaContainer);

                createAdSlot(
                    qwery('.container', faciaContainer)[0],
                    $faciaContainer.data('sponsorship'),
                    {
                        sponsor: $faciaContainer.data('sponsor')
                    }
                );
            });

            $('.js-sponsored-container').each(function (container) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    var $container = bonzo(container);

                    createAdSlot(
                        container,
                        $container.data('sponsorship'),
                        {
                            sponsor : $container.data('sponsor'),
                            keywords: $container.data('keywords')
                        }
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
                    $container.hasClass('js-sponsored-container') &&
                    qwery('.ad-slot--paid-for-badge', container).length === 0
                ) {
                    $adSlot = createAdSlot(
                        container,
                        $container.data('sponsorship'),
                        {
                            sponsor : $container.data('sponsor'),
                            keywords: $container.data('keywords')
                        }
                    );
                    // add slot to dfp
                    dfp.addSlot($adSlot);
                }
            }

        };

    return badges;

});
