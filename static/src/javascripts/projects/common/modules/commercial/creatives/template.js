define([
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large-v2.html',
    'text!common/views/commercial/creatives/logo-ad-feature.html',
    'text!common/views/commercial/creatives/logo-sponsored.html',
    'text!common/views/commercial/creatives/manual-inline.html',
    'text!common/views/commercial/creatives/manual-multiple.html',
    'text!common/views/commercial/creatives/manual-single.html'
], function (
    $,
    template,
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
    }

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

        if (typeof templates[this.params.creative] === 'string') {
            templates[this.params.creative] = template(templates[this.params.creative]);
        }
    };

    Template.prototype.create = function () {
        var creativeHtml = templates[this.params.creative](this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
