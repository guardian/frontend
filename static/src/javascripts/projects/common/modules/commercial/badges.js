define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-idle',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/create-slot',
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
    addSlot,
    createSlot,
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
    };

    function addPreBadge($adSlot, header, sponsor) {
        if (sponsor) {
            $adSlot.append(template(
                badgeTpl,
                {
                    header:  header,
                    sponsor: sponsor
                }
            ));
        }
    }

    function renderAd(item, sponsorship, opts, fallback) {
        var badgeConfig = badgesConfig[sponsorship],
            slotTarget  = badgeConfig.namePrefix + 'badge',
            name        = slotTarget + (++badgeConfig.count),
            $adSlot     = bonzo(createSlot(
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
    }

    function init() {
        if (!commercialFeatures.badges) {
            return false;
        }

        return Promise.all(qwery('.js-sponsored-front').map(processFront)
            .concat(qwery('.js-sponsored-container').map(processContainer))
            .concat(qwery('.js-sponsored-card').map(processCard))
        );
    }

    function processFront(front) {
        return renderAd(
            qwery('.fc-container', front)[0],
            front.getAttribute('data-sponsorship'),
            {
                sponsor: front.getAttribute('data-sponsor')
            },
            '.js-container__header'
        );
    }

    function processContainer(container) {
        return processItem('.js-container__header', container);
    }

    function processCard(card) {
        return processItem('.js-card__header', card);
    }

    function processItem(fallback, item) {
        if (qwery('.ad-slot--paid-for-badge', item).length === 0) {
            if (!item.hasAttribute('data-sponsorship')) {
                return;
            }

            return renderAd(
                item,
                item.getAttribute('data-sponsorship'),
                {
                    sponsor:  item.getAttribute('data-sponsor'),
                    series:   item.getAttribute('data-series'),
                    keywords: item.getAttribute('data-keywords')
                },
                fallback
            );
        }
    }

    return {

        init: init,

        // add a badge to a container (if appropriate)
        add: function (container) {
            container = container instanceof Element ? container : container[0];

            if (
                bonzo(container).hasClass('js-sponsored-container') &&
                qwery('.ad-slot--paid-for-badge', container).length === 0
            ) {
                return renderAd(
                    container,
                    container.getAttribute('data-sponsorship'),
                    {
                        sponsor:  container.getAttribute('data-sponsor'),
                        series:   container.getAttribute('data-series'),
                        keywords: container.getAttribute('data-keywords')
                    },
                    '.js-container__header'
                ).then(addSlot);
            }
        },

        // for testing
        reset: function () {
            for (var type in badgesConfig) {
                badgesConfig[type].count = 0;
            }
        }
    };
});
