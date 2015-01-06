define([
    'bonzo',
    'qwery',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp',
    'text!common/views/commercial/badge.html'
], function (
    bonzo,
    qwery,
    once,
    $,
    config,
    template,
    createAdSlot,
    dfp,
    badgeTpl
) {

    var badgesConfig = {
            sponsoredfeatures: {
                count:      0,
                header:     'Sponsored by:',
                namePrefix: 'sp'
            },
            'advertisement-features': {
                count:      0,
                header:     'Brought to you by:',
                namePrefix: 'ad'
            },
            'foundation-features': {
                count:      0,
                header:     'Supported by:',
                namePrefix: 'fo'
            }
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
        renderAd = function (container, sponsorship, opts) {
            var badgeConfig = badgesConfig[sponsorship],
                slotTarget  = badgeConfig.namePrefix + 'badge',
                name        = slotTarget + (++badgeConfig.count),
                $adSlot     = bonzo(createAdSlot(
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

            $('.js-sponsored-front').each(function (front) {
                var $front = bonzo(front);

                renderAd(
                    qwery('.fc-container', front)[0],
                    $front.data('sponsorship'),
                    {
                        sponsor: $front.data('sponsor')
                    }
                );
            });

            $('.js-sponsored-container').each(function (container) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    var $container = bonzo(container);

                    renderAd(
                        container,
                        $container.data('sponsorship'),
                        {
                            sponsor:  $container.data('sponsor'),
                            keywords: $container.data('keywords')
                        }
                    );
                }
            });
        },
        badges = {

            init: init,

            // add a badge to a container (if appropriate)
            add: function (container) {
                var $adSlot,
                    $container = bonzo(container);

                if (
                    $container.hasClass('js-sponsored-container') &&
                    qwery('.ad-slot--paid-for-badge', container).length === 0
                ) {
                    $adSlot = renderAd(
                        container,
                        $container.data('sponsorship'),
                        {
                            sponsor:  $container.data('sponsor'),
                            keywords: $container.data('keywords')
                        }
                    );
                    // add slot to dfp
                    dfp.addSlot($adSlot);
                }
            },

            // for testing
            reset: function () {
                for(var type in badgesConfig) {
                    badgesConfig[type].count = 0;
                }
            }

        };

    return badges;

});
