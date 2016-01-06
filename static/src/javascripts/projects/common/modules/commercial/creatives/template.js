define([
    'common/utils/$',
    'common/utils/config',
    'common/views/svgs',
    'template!common/views/commercial/creatives/ad-feature-mpu.html',
    'template!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'template!common/views/commercial/creatives/ad-feature-mpu-large-v2.html',
    'template!common/views/commercial/creatives/logo-ad-feature.html',
    'template!common/views/commercial/creatives/logo-sponsored.html',
    'template!common/views/commercial/creatives/manual-inline.html',
    'template!common/views/commercial/creatives/manual-multiple.html',
    'template!common/views/commercial/creatives/manual-single.html'
], function (
    $,
    config,
    svgs
) {

    var templates = {
        'ad-feature-mpu': arguments[3],
        'ad-feature-mpu-large': arguments[4],
        'ad-feature-mpu-large-v2': arguments[5],
        'logo-ad-feature': arguments[6],
        'logo-sponsored': arguments[7],
        'manual-inline': arguments[8],
        'manual-multiple': arguments[9],
        'manual-single': arguments[10]
    };

    /**
     * Create simple templated creatives
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;

        this.params.marque36icon = svgs('marque36icon');
        this.params.marque54icon = svgs('marque54icon');
        this.params.arrowRight = svgs('arrowRight', ['i-right']);
        this.params.logoguardian = svgs('logoguardian');
        this.params.marque36iconCreativeMarque = svgs('marque36icon', ['creative__marque']);
        this.params.logoFeatureLabel = config.switches.newCommercialContent ? 'Paid for by:' : 'Brought to you by:';
    };

    Template.prototype.create = function () {
        var creativeHtml = templates[this.params.creative](this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
