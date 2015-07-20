define([
    'fastdom',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/experiments/ab'
], function (
    fastDom,
    $,
    ajax,
    mediator,
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
        tests.forEach(function (test) {
            if (ab.shouldRunTest('FilmContainers', test.variant)) {
                loadContainer(test.containerId);
            }
        });
    };
});
