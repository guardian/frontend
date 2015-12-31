define([
    'common/utils/$',
    'common/views/svgs',
    'ldsh!common/views/commercial/creatives/ad-feature-mpu',
    'ldsh!common/views/commercial/creatives/ad-feature-mpu-large',
    'ldsh!common/views/commercial/creatives/ad-feature-mpu-large-v2',
    'ldsh!common/views/commercial/creatives/logo-ad-feature',
    'ldsh!common/views/commercial/creatives/logo-sponsored',
    'ldsh!common/views/commercial/creatives/manual-inline',
    'ldsh!common/views/commercial/creatives/manual-multiple',
    'ldsh!common/views/commercial/creatives/manual-single'
], function (
    $,
    svgs
) {

    var templates = {
        'ad-feature-mpu': arguments[2],
        'ad-feature-mpu-large': arguments[3],
        'ad-feature-mpu-large-v2': arguments[4],
        'logo-ad-feature': arguments[5],
        'logo-sponsored': arguments[6],
        'manual-inline': arguments[7],
        'manual-multiple': arguments[8],
        'manual-single': arguments[9]
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
    };

    Template.prototype.create = function () {
        var creativeHtml = templates[this.params.creative](this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
