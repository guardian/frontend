define([
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
        $('.js-replicated-links').removeClass('element-replicated-links--not-in-test');
        $('.js-replicated-link').each(upgradeLink);
        //}
    }

    return {
        upgradeLinks: upgradeLinks
    };
});
