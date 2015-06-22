define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    bonzo,
    fastdom,
    $
) {
    return function () {
        fastdom.write(function () {
            var button = bonzo.create('<button class="button button--large button--primary button--show-more content__read-more-button">' +
                    '<i class="i i-plus-white"></i> Read more'
                    + '</button>')[0],
                $articleBody = $('.js-article__body'),
                cls = 'content__article-body--truncated';

            bean.on(button, 'click', function () {
                fastdom.write(function () {
                    $articleBody.removeClass(cls);
                });
            });

            $articleBody.addClass(cls)
                .append('<div class="content__truncation-overlay"></div>')
                .append(button);
        });
    };
});
