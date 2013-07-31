define(['common', 'bean', 'modules/inview'], function (common, bean, Inview) {

    function AdvertsAnalytics(opts) {
        console.log(opts.config);
        var context     = opts.context,
            contentType = opts.config.page.contentType;

        bean.on(context, 'inview', function(e) {
            e.target.style.background = 'red';

            console.log('IMPRESSION: ' + e.target.getAttribute('data-link-name'));
        });


        if (contentType === 'Article') {
            common.$g('.article-body p:nth-of-type(3n)', context).after('<i class="p-marker" data-link-name="every 3rd marker"></i>');
            common.$g('.article-body p:nth-of-type(10n)', context).after('<i class="p-marker" data-link-name="every 10th marker"></i>');
        }


        var inview = new Inview(context, '.ad-slot, .p-marker');
    }

    return AdvertsAnalytics;
});