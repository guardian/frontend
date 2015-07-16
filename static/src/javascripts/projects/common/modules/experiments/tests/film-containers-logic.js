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
        containerSelector = '.content-footer',
        container;

    function loadContainer(id) {
        ajax({
            url: '/container/' + id + '.json',
            type: 'json',
            crossOrigin: true
        })
        .then(function (res) {
            if (res && res.html) {
                container = container || $(containerSelector);
                fastDom.write(function () {
                    container.prepend(res.html);
                    mediator.emit('page:new-content', container);
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
