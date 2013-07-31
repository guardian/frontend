define(['common', 'bean', 'modules/inview'], function (common, bean, Inview) {

    function AdvertsAnalytics(config, context) {
        var context     = opts.context,
            contentType = opts.config.page.contentType;

        // Setup listeners
        bean.on(context, 'inview', function(e) {
            //e.target.style.background = 'red';
            var inviewName = e.target.getAttribute('data-inview-name');

            common.mediator.emit('module:analytics:event:adimpression', inviewName);
            console.log('IMPRESSION: ' + inviewName);
        });


        // Label up ad slots
        common.$g('.ad-slot').each(function() {
            this.setAttribute('data-inview-name', this.getAttribute('data-link-name'));
        });

        // Label up paragraphs
        if (config.page.contentType === 'Article') {
            common.$g('.article-body p:nth-of-type(3n)', context).attr('data-inview-name','every 3rd para');
            common.$g('.article-body p:nth-of-type(5n)', context).attr('data-inview-name','every 5th para');
            common.$g('.article-body p:nth-of-type(7n)', context).attr('data-inview-name','every 7th para');
        }


        var inview = new Inview('[data-inview-name]', context);
    }

    return AdvertsAnalytics;
});