define([
    'bean',
    'fastdom',
    'qwery',
    'Promise',
    'common/modules/experiments/ab',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    fastdom,
    qwery,
    Promise,
    ab,
    _,
    $,
    ajax,
    config,
    detect,
    mediator
) {
    function upgradeLink(el) {
        var a = $('a', el),
            href = a.attr('href'),
            matches = href.match(/^(?:https?:\/\/(?:www\.|m\.code\.dev-)theguardian\.com)?(\/.*)/);

        if (matches && matches[1]) {
            return ajax({
                url: '/embed/headline' + matches[1] + '.json',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.html) {
                    fastdom.write(function () {
                        $(a).html(resp.html);
                        mediator.emit('replicated-link:loaded', el);
                    });
                }
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function upgradeLinks() {
        // TODO commented out while Zef styles it
        //if (ab.getTestVariantId('ReplicatedLinks') &&
        //    ab.testCanBeRun('ReplicatedLinks') &&
        //    ab.getTestVariantId('ReplicatedLinks') === 'variant') {
        var container = $('.js-replicated-links');
        container.removeClass('element-replicated-links--not-in-test')
            .addClass('element-replicated-links--contracted');
        $('.js-replicated-link').each(upgradeLink);
        bean.on(qwery('.js-replicated-links-more')[0], 'click', function (e) {
            container.removeClass('element-replicated-links--contracted');
            $('.js-replicated-links-more').addClass("element-replicated-links__more--hidden")
        });
        //}
    }

    return {
        upgradeLinks: upgradeLinks
    };
});
