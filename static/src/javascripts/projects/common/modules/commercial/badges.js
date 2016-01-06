define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-idle',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp-api',
    'template!common/views/commercial/badge.html',
    'lodash/collections/map'
], function (
    bonzo,
    qwery,
    Promise,
    $,
    config,
    idleFastdom,
    createAdSlot,
    commercialFeatures,
    dfp,
    badgeTpl,
    map) {
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
                $adSlot.append(badgeTpl({
                    header:  header,
                    sponsor: sponsor
                }));
            }
        },
        renderAd = function (container, sponsorship, opts) {
            var badgeConfig = badgesConfig[sponsorship],
                slotTarget  = badgeConfig.namePrefix + 'badge',
                name        = slotTarget + (++badgeConfig.count),
                $adSlot     = bonzo(createAdSlot(
                                name,
                                ['paid-for-badge', 'paid-for-badge--front'],
                                opts.series,
                                opts.keywords,
                                slotTarget
                              ));

            addPreBadge($adSlot, badgeConfig.header, opts.sponsor);

            return new Promise(function (resolve) {
                idleFastdom.write(function () {
                    $('.js-container__header', container)
                        .after($adSlot);

                    resolve($adSlot);
                });
            });
        },
        init = function () {
            var sponsoredFrontPromise,
                sponsoredContainersPromise;

            if (!commercialFeatures.badges) {
                return false;
            }

            sponsoredFrontPromise = Promise.all(map($('.js-sponsored-front'), function (front) {
                var $front = bonzo(front);

                return renderAd(
                    qwery('.fc-container', front)[0],
                    $front.data('sponsorship'),
                    {
                        sponsor: $front.data('sponsor')
                    }
                );
            }));

            sponsoredContainersPromise = sponsoredFrontPromise.then(function () {
                return Promise.all(map($('.js-sponsored-container'), function (container) {
                    if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                        var $container = bonzo(container);

                        return renderAd(
                            container,
                            $container.data('sponsorship'),
                            {
                                sponsor:  $container.data('sponsor'),
                                series:   $container.data('series'),
                                keywords: $container.data('keywords')
                            }
                        );
                    }
                }));
            });

            return sponsoredContainersPromise;
        },
        badges = {

            init: init,

            // add a badge to a container (if appropriate)
            add: function (container) {
                var $container = bonzo(container);

                if (
                    $container.hasClass('js-sponsored-container') &&
                    qwery('.ad-slot--paid-for-badge', container).length === 0
                ) {
                    return renderAd(
                        container,
                        $container.data('sponsorship'),
                        {
                            sponsor:  $container.data('sponsor'),
                            series:   $container.data('series'),
                            keywords: $container.data('keywords')
                        }
                    ).then(function ($adSlot) {
                        // add slot to dfp
                        dfp.addSlot($adSlot);
                    });
                }
            },

            // for testing
            reset: function () {
                for (var type in badgesConfig) {
                    badgesConfig[type].count = 0;
                }
            }

        };

    return badges;

});
