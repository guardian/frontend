define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/$'
], function (
    bean,
    bonzo,
    fastdom,
    config,
    storage,
    $
) {
    var minChildren = 8,
        articleBodySelector = '.js-article__body',
        truncatorClass = 'content__article-body--truncated',
        storageKey = 'gu.expanded-article';

    function truncate() {
        var $articleBody = $(articleBodySelector),
            truncator;

        if ($articleBody && $articleBody[0].children.length >= minChildren) {
            truncator = bonzo.create(
                '<div class="content__truncator">' +
                    '<div class="content__truncator__overlay"></div>' +
                    '<button class="button button--large button--primary button--show-more" data-link-name="more">' +
                        '<i class="i i-plus-white"></i> Continue reading...' +
                    '</button>' +
                '</div>'
            )[0];

            bean.on(truncator, 'click', function () {
                fastdom.write(function () {
                    $articleBody.removeClass(truncatorClass);
                });
                storage.session.set(storageKey, config.page.pageId);
            });

            fastdom.write(function () {
                $articleBody.addClass(truncatorClass).append(truncator);
            });
        }
    }

    return function () {
        if (storage.session.get(storageKey) !== config.page.pageId) {
            truncate();
        }
    };
});
