define(['common', 'bean', 'modules/inview'], function (common, bean, Inview) {

    function AdvertsAnalytics() {

        // Setup listeners
        bean.on(document, 'inview', function(e) {
            var inviewName = e.target.getAttribute('data-inview-name');

            common.mediator.emit('module:analytics:adimpression', inviewName);
        });

        // Label up ad slots
        common.$g('.ad-slot').each(function() {
            this.setAttribute('data-inview-name', this.getAttribute('data-link-name'));
        });

        var inview = new Inview('[data-inview-name]', document);
    }

    return AdvertsAnalytics;
});