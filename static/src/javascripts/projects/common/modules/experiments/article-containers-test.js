define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/config',
    'common/modules/experiments/ab'
], function (
    fastDom,
    $,
    _,
    ajax,
    mediator,
    config,
    ab
) {
    var targetEl = '.js-related';

    function loadContainer(test) {
        ajax({
            url: test.endpoint,
            type: 'json',
            crossOrigin: true
        })
        .then(function (res) {
            var el;

            if (res.html) {
                el = $.create(res.html);

                if (test.title) {
                    $('.fc-container__header__title', el).html(test.title);
                }

                $('.js-show-more-button', el).remove();

                fastDom.write(function () {
                    $(targetEl).append(el);
                    mediator.emit('page:new-content', el);
                });
            }
        });
    }

    return function (tests) {
        var test = _.find(tests, function (test) {
            return ab.shouldRunTest(test.id, test.variant);
        });

        if (test) {
            loadContainer(test);
        }

        return !!test;
    };
});
