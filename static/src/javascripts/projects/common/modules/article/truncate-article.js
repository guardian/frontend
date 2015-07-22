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
    var storageKey = 'gu.expanded-article';

    return function () {
        if (storage.session.get(storageKey) !== config.page.pageId) {
            var overlay = bonzo.create('<div class="content__truncation-overlay"></div>')[0],
                button = bonzo.create('<button class="button button--large button--primary button--show-more" data-link-name="more">' +
                    '<i class="i i-plus-white"></i> Continue reading...' +
                '</button>')[0],
                $articleBody = $('.js-article__body'),
                truncatorClass = 'content__article-body--truncated';

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
                    .append(overlay)
                    .after(button);
            });
        }
    };
});
