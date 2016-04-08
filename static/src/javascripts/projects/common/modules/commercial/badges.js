define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-idle',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'text!common/views/commercial/badge.html',
    'lodash/collections/map'
], function (
    bonzo,
    qwery,
    Promise,
    $,
    config,
    template,
    idleFastdom,
    dfp,
    createAdSlot,
    commercialFeatures,
    badgeTpl,
    map
) {
    var badgesConfig = {
            sponsoredfeatures: {
                count:      0,
                header:     'Supported by',
                namePrefix: 'sp'
            },
            'advertisement-features': {
                count:      0,
                header:     'Paid for by',
                namePrefix: 'ad'
            },
            'foundation-features': {
                count:      0,
                header:     'Supported by',
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
        renderAd = function (item, sponsorship, opts) {
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
                    var placeholder = $('.js-badge-placeholder', item);

                    if (placeholder.length) {
                        placeholder.replaceWith($adSlot);
                    } else {
                        $(opts.fallback, item).after($adSlot);
                    }

                    resolve($adSlot);
                });
            });
        },
        init = function () {
            var sponsoredFrontPromise,
                sponsoredContainersPromise,
                sponsoredCardsPromise;

            if (!commercialFeatures.badges) {
                return false;
            }

            sponsoredFrontPromise = Promise.all(map($('.js-sponsored-front'), function (front) {
                var $front = bonzo(front);

                return renderAd(
                    qwery('.fc-container', front)[0],
                    $front.data('sponsorship'),
                    {
                        sponsor: $front.data('sponsor'),
                        fallback: '.js-container__header'
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
                                keywords: $container.data('keywords'),
                                fallback: '.js-container__header'
                            }
                        );
                    }
                }));
            });

            sponsoredCardsPromise = sponsoredContainersPromise.then(function () {
                return Promise.all(map($('.js-sponsored-card'), function (card) {
                    if (qwery('.ad-slot--paid-for-badge', card).length === 0) {
                        var $card = bonzo(card);

                        return renderAd(
                            card,
                            $card.data('sponsorship'),
                            {
                                sponsor:  $card.data('sponsor'),
                                series:   $card.data('series'),
                                keywords: $card.data('keywords'),
                                fallback: '.js-card__header'
                            }
                        );
                    }
                }));
            });

            return sponsoredCardsPromise;
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
