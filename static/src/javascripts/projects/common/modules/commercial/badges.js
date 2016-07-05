define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features',
    'text!common/views/commercial/badge.html'
], function (
    bonzo,
    qwery,
    Promise,
    $,
    config,
    template,
    fastdom,
    addSlot,
    createSlot,
    commercialFeatures,
    badgeTpl
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

    return {

        init: init,

        // add a badge to a container (if appropriate)
        add: function (container) {
            if (container) {
                container = container instanceof Element ? container : container[0];

                if (bonzo(container).hasClass('js-sponsored-container')) {
                    return processContainer(container).then(addSlot);
                }
            }
        },

        // for testing
        reset: function () {
            for (var type in badgesConfig) {
                badgesConfig[type].count = 0;
            }
        }
    };

    function init() {
        if (!commercialFeatures.badges) {
            return false;
        }

        return Promise.all(qwery('.js-sponsored-front').map(processFront)
            .concat(qwery('.js-sponsored-container').map(processContainer))
            .concat(qwery('.js-sponsored-card').map(processCard))
        );
    }

    function addPreBadge(adSlot, header, sponsor) {
        if (sponsor) {
            adSlot.insertAdjacentHTML('beforeend', template(
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
            adSlot      = createSlot(
                            name,
                            ['paid-for-badge', 'paid-for-badge--front'],
                            opts.series,
                            opts.keywords,
                            slotTarget
                          );

        addPreBadge(adSlot, badgeConfig.header, opts.sponsor);

        return fastdom.write(function () {
            var placeholder = $('.js-badge-placeholder', item);

            if (placeholder.length) {
                placeholder.replaceWith(adSlot);
            } else {
                $(fallback, item).after(adSlot);
            }

            return adSlot;
        });
    }

    function processFront(front) {
        return processItem('.js-container__header', qwery('.fc-container', front)[0], front);
    }

    function processContainer(container) {
        return processItem('.js-container__header', container);
    }

    function processCard(card) {
        return processItem('.js-card__header', card);
    }

    function processItem(fallback, element, dataElement) {
        if (qwery('.ad-slot--paid-for-badge', element).length === 0) {
            dataElement = dataElement || element;

            if (!dataElement.hasAttribute('data-sponsorship')) {
                return;
            }

            return renderAd(
                element,
                dataElement.getAttribute('data-sponsorship'),
                {
                    sponsor:  dataElement.getAttribute('data-sponsor'),
                    series:   dataElement.getAttribute('data-series'),
                    keywords: dataElement.getAttribute('data-keywords')
                },
                fallback
            );
        }
    }
});
