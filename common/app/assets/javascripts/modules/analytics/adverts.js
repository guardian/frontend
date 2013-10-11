define(['common', 'bean', 'modules/inview'], function (common, bean, Inview) {

    function InViewAdverts(config, context) {

        // Label up ad slots
        common.$g('.ad-slot', context).each(function() {
            this.setAttribute('data-inview-name', this.getAttribute('data-link-name'));
        });

        // Label up paragraphs
        if (config.page.contentType === 'Article') {
            common.$g('.article-body p:nth-of-type(10n)', context).attr('data-inview-name','every 10th para');
        }


        var inview = new Inview('[data-inview-name]', context);
    }

    return InViewAdverts;
});