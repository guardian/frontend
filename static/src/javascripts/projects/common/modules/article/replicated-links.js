define([
    'bean',
    'bonzo',
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
    bonzo,
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
        if (true || (ab.getTestVariantId('ReplicatedLinks') &&
            ab.testCanBeRun('ReplicatedLinks') &&
            ab.getTestVariantId('ReplicatedLinks') === 'variant')) {
            $('.js-replicated-link').each(upgradeLink);
        }
    }

    function mergeLinks(container, related) {
        var sorted;
        container.append(related);
        sorted = _.sortBy(container[0].children, function (value) {
            return bonzo(value).attr('data-timestamp');
        });
        container.empty();
        container.append(sorted);
        // TODO fastdom
        var container2 = $('.js-replicated-links'),
            links = $('.js-replicated-links__links', links);
        container2.removeClass('element-replicated-links--not-in-test');
        if (links.height() > 150) {
            var more = $('.js-replicated-links-more'),
                less = $('.js-replicated-links-less');
            links.addClass('element-replicated-links__links--contracted');
            more.removeClass('element-replicated-links__more--hidden');
            bean.on(more[0], 'click', function () {
                links.removeClass('element-replicated-links__links--contracted');
                more.addClass('element-replicated-links__more--hidden');
                less.removeClass('element-replicated-links__more--hidden');
            });
            bean.on(less[0], 'click', function () {
                links.addClass('element-replicated-links__links--contracted');
                less.addClass('element-replicated-links__more--hidden');
                more.removeClass('element-replicated-links__more--hidden');
            });
        }
        mediator.emit('replicated-link:related:loaded');
    }

    // get /embed/related/article.json
    function addRelated() {
        var url = '/embed/related/' + config.page.pageId + '.json',
            container = $('.js-replicated-links__links');
        if (container.length) {
            return ajax({
                url: url,
                crossOrigin: true
            }).then(function (resp) {
                var respDiv;
                if (resp.html) {
                    respDiv = bonzo(bonzo.create(resp.html));
                    fastdom.write(function () {mergeLinks(container, respDiv);});
                }
            });
        } else {
            return Promise.resolve(null);
        }
    }

    return {
        upgradeLinks: upgradeLinks,
        addRelated: addRelated
    };
});
