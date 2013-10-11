define(['common', 'bean', 'modules/inview'], function (common, bean, Inview) {

    function AdvertsAnalytics(context) {

        // Setup listeners
        bean.on(context, 'inview', function(e) {
            var inviewName = e.target.getAttribute('data-inview-name');

            common.mediator.emit('module:analytics:adimpression', inviewName);
        });

        // Label up ad slots
        common.$g('.ad-slot', context).each(function() {
            this.setAttribute('data-inview-name', this.getAttribute('data-link-name'));
        });

        var inview = new Inview('[data-inview-name]', context);
    }

    return AdvertsAnalytics;
});