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
    var tests = [
            {variant: 'curated', containerId: '1ce8-6c50-425f-9d32'},
            {variant: 'news',    containerId: 'b073-c5d7-c8a9-1e32'}
        ],
        containerSelector = '.content-footer';

    function loadContainer(id) {
        ajax({
            url: '/container/' + id + '.json',
            type: 'json',
            crossOrigin: true
        })
        .then(function (res) {
            var el;

            if (res && res.html) {
                el = $.create(res.html);

                $('.fc-container__header__title', el).html('more');
                $('.js-show-more-button', el).remove();

                fastDom.write(function () {
                    $(containerSelector).prepend(el);
                    mediator.emit('page:new-content', el);
                });
            }
        });
    }

    return function () {
        var test;

        if (config.page.section === 'film') {
            test = _.find(tests, function (test) {
                return ab.shouldRunTest('FilmContainers', test.variant);
            });

            if (test) {
                loadContainer(test.containerId);
            }
        }

        return !!test;
    };
});
