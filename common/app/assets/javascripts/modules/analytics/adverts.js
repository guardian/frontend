define([
    'utils/mediator',
    'bean',
    'modules/inview'
], function (
    mediator,
    bean,
    Inview
) {

    function AdvertsAnalytics() {

        // Setup listeners
        bean.on(document, 'inview', function(e) {
            var size = (window.innerWidth > 810) ? 'median' : 'base',
                inviewName = e.target.getAttribute('data-inview-name'),
                slot = e.target.getAttribute('data-' + size);

            mediator.emit('module:analytics:adimpression', inviewName+ ':' + slot);
        });

        var inview = new Inview('[data-inview-name]', document);
    }

    return AdvertsAnalytics;
});
