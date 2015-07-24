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
        storageKey = 'gu.expanded-article',
        truncatorClass = 'content__article-body--truncated';

    function truncate () {
        var $articleBody = $(articleBodySelector),
            button;

        if ($articleBody && $('> *', $articleBody).length > minChildren) {
            button = bonzo.create(
                '<button class="button button--large button--primary button--show-more" data-link-name="more">' +
                    '<i class="i i-plus-white"></i> Continue reading...' +
                '</button>'
            )[0];

            bean.on(button, 'click', function () {
                fastdom.write(function () {
                    $articleBody.removeClass(truncatorClass);
                    $(button).remove();
                });
                storage.session.set(storageKey, config.page.pageId);
            });

            fastdom.write(function () {
                $articleBody
                    .addClass(truncatorClass)
                    .append('<div class="content__truncation-overlay"></div>')
                    .after(button);
            });
        }
    };

    return function () {
        if (storage.session.get(storageKey) !== config.page.pageId) {
            truncate();
        }
    };
});
