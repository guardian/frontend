define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/mediator',
    'facia/modules/ui/container-show-more'
], function (
    fastdom,
    $,
    _,
    ajax,
    mediator,
    containerShowMore
) {
    var tests = [
            {variant: 'curated', containerId: '1ce8-6c50-425f-9d32'}
            {variant: 'news',    containerId: 'b073-c5d7-c8a9-1e32'}
            {variant: 'reviews', containerId: '5414-75a5-6df6-0503'}
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
                container.prepend(res.html);
                mediator.emit('page:new-content', container);
            }
        });
    }

    return function () {
        tests.forEach(function(test) {
            if (ab.shouldRunTest('FilmExtras', test.variant)) {
                loadContainer(test.containerId);
            }
        });
    };
});
