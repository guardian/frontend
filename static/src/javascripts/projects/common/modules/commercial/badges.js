define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-idle',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features',
    'template!common/views/commercial/badge.html',
    'lodash/collections/map'
], function (
    bonzo,
    qwery,
    Promise,
    $,
    config,
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
                $adSlot.append(badgeTpl(
                    {
                        header:  header,
                        sponsor: sponsor
                    }
                ));
            }
        },
        renderAd = function (item, sponsorship, opts, fallback) {
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
                        $(fallback, item).after($adSlot);
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
                        sponsor: $front.data('sponsor')
                    },
                    '.js-container__header'
                );
            }));

            sponsoredContainersPromise = sponsoredFrontPromise.then(function () {
                return Promise.all($('.js-sponsored-container').map(processItem.bind(undefined, '.js-container__header')));
            });

            sponsoredCardsPromise = sponsoredContainersPromise.then(function () {
                return Promise.all($('.js-sponsored-card').map(processItem.bind(undefined, '.js-card__header')));
            });

            return sponsoredCardsPromise;

            function processItem(fallback, item) {
                if (qwery('.ad-slot--paid-for-badge', item).length === 0) {
                    var $item = bonzo(item);

                    if (!item.hasAttribute('data-sponsorship')) {
                        return;
                    }

                    return renderAd(
                        item,
                        $item.data('sponsorship'),
                        {
                            sponsor:  $item.data('sponsor'),
                            series:   $item.data('series'),
                            keywords: $item.data('keywords')
                        },
                        fallback
                    );
                }
            }
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
                        },
                        '.js-container__header'
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
