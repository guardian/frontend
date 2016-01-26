define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'common/modules/commercial/creatives/template-preprocessor',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large-v2.html',
    'text!common/views/commercial/creatives/logo-ad-feature.html',
    'text!common/views/commercial/creatives/logo-sponsored.html',
    'text!common/views/commercial/creatives/manual-inline.html',
    'text!common/views/commercial/creatives/manual-multiple.html',
    'text!common/views/commercial/creatives/manual-single.html'
], function (
    Promise,
    $,
    config,
    template,
    fastdom,
    svgs,
    templatePreprocessor
) {
    /**
     * Create simple templated creatives
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;

        if (this.params.Toneclass) {
            this.params.soulmates = params.Toneclass.indexOf('soulmates') !== -1;
            this.params.HeaderToneclass = 'commercial__header--' + this.params.Toneclass.replace('commercial--tone-', '');
        }

        this.params.marque36icon = svgs('marque36icon');
        this.params.marque54icon = svgs('marque54icon');
        this.params.logosoulmates = svgs('logosoulmates');
        this.params.logosoulmatesjoin = svgs('logosoulmatesjoin');
        this.params.arrowRight = svgs('arrowRight', ['i-right']);
        this.params.logoguardian = svgs('logoguardian');
        this.params.marque36iconCreativeMarque = svgs('marque36icon', ['creative__marque']);
        this.params.logoFeatureLabel = config.switches.newCommercialContent ? 'Paid for by' : 'Brought to you by:';
    };

    Template.prototype.create = function () {
        return new Promise(function (resolve) {
            require(['text!common/views/commercial/creatives/' + this.params.creative + '.html'], function (creativeTpl) {
                if (templatePreprocessor[this.params.creative]) {
                    templatePreprocessor[this.params.creative](this);
                }

                var creativeHtml = template(creativeTpl, this.params);
                var $ad = $.create(creativeHtml);

                resolve(fastdom.write(function () {
                    return $ad.appendTo(this.$adSlot);
                }, this));
            }.bind(this));
        }.bind(this));
    };

    return Template;

});
