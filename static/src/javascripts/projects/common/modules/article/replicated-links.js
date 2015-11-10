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

    /*
    FIXME this causes jank because it relays out the whole document
    it causes jumping because it adds in a block of text
    perhaps there is a way to reserve the space and calculate the layout of this on its own
     */
    function mergeLinks(container, related) {
        var sorted;
        container.append(related);
        sorted = _.sortBy(container[0].children, function (value) {
            return bonzo(value).attr('data-timestamp');
        });
        container.empty();
        container.append(sorted);
        var container2 = $('.js-replicated-links'),
            links = $('.js-replicated-links__links', links);
        // causes full relayout
        container2.removeClass('element-replicated-links--not-in-test');
        fastdom.read(function () {
            var tooHigh = links.height() > 150;
            fastdom.write(function () {
                if (tooHigh) {
                    // this block causes another full relayout
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
                    container2.removeClass('element-replicated-links--not-in-test');
                }
                mediator.emit('replicated-link:related:loaded');
            });
        });
    }

    // get /embed/related/article.json
    function addRelated() {
        var url = '/embed/related/' + config.page.pageId + '.json',
            container = $('.js-replicated-links__internal');
        if (container.length) {
            return ajax({
                url: url,
                crossOrigin: true
            }).then(function (resp) {
                fastdom.defer(function () {
                    var respDiv;
                    if (resp.html) {
                        respDiv = bonzo(bonzo.create(resp.html));
                        fastdom.write(function () {mergeLinks(container, respDiv);});
                    }
                });
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
