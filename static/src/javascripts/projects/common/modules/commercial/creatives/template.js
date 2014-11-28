define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/logo-ad-feature.html',
    'text!common/views/commercial/creatives/logo-foundation-funded.html',
    'text!common/views/commercial/creatives/logo-foundation-funded-partners.html',
    'text!common/views/commercial/creatives/logo-sponsored.html'
], function (
    $,
    template,
    adFeatureMpuTpl,
    adFeatureMpuLargeTpl,
    logoAdFeatureTpl,
    logoFoundationFundedTpl,
    logoFoundationFundedPartnersTpl,
    logoSponsoredTpl
) {

    /**
     * Create simple templated creatives
     */
    var creativeTemplates = {
            'ad-feature-mpu': adFeatureMpuTpl,
            'ad-feature-mpu-large': adFeatureMpuLargeTpl,
            'ad-single-manual': adSingleManual
        },
        Template = function ($adSlot, params) {
            this.$adSlot = $adSlot;
            this.params  = params;
        };

    Template.prototype.create = function () {
        var creativeHtml = template(creativeTemplates[this.params.creative], this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
