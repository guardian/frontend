define([
    'qwery',
    'bonzo',
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/template',
    'common/utils/config',
    'common/modules/commercial/dfp'
], function (
    qwery,
    bonzo,
    defaults,
    once,
    $,
    template,
    globalConfig,
    dfp
) {

    var addPreBadge = function($adSlot, isSponsored, sponsor) {
            if (sponsor) {
                $adSlot.append(template(
                    '<div class="ad-slot--paid-for-badge__inner ad-slot__content--placeholder">' +
                        '<h3 class="ad-slot--paid-for-badge__header">{{header}}</h3>' +
                        '<p class="ad-slot--paid-for-badge__header">{{sponsor}}</p>' +
                    '</div>',
                    {
                        header: isSponsored ? 'Sponsored by:' : 'Brought to you by:',
                        sponsor: sponsor
                    }
                ));
            }
        },
        createAdSlot = function(container, isSponsored, opts) {
            var slotTarget = (isSponsored ? 'sp' : 'ad') + 'badge';
            var name = slotTarget;
            if (opts.containerIndex) {
                name += opts.containerIndex;
            }
            var $adSlot = bonzo(dfp.createAdSlot(
                name, ['paid-for-badge', 'paid-for-badge--front'], opts.keywords, slotTarget
            ));
            if (isSponsored) {
                addPreBadge($adSlot, true, opts.sponsor);
            } else {
                addPreBadge($adSlot, false, opts.sponsor);
            }
            $('.container__header', container)
                .after($adSlot);
        },
        init = function(c) {

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

            $('.facia-container--sponsored, .facia-container--advertisement-feature').each(function(faciaContainer) {
                var $faciaContainer = bonzo(faciaContainer);
                createAdSlot(
                    qwery('.container', faciaContainer)[0],
                    $faciaContainer.hasClass('facia-container--sponsored'),
                    { sponsor: $faciaContainer.data('sponsor') }
                );
            });
            $('.container--sponsored, .container--advertisement-feature').each(function(container, index) {
                if (qwery('.ad-slot--paid-for-badge', container).length === 0) {
                    var $container = bonzo(container);
                    createAdSlot(
                        container,
                        bonzo(container).hasClass('container--sponsored'),
                        { containerIndex: index, keywords: $container.data('keywords'), sponsor: $container.data('sponsor') }
                    );
                }
            });
        },
        badges = {

            init: once(init),

            // really only useful for testing
            reset: function() {
                badges.init = once(init);
            }

        };

    return badges;

});
