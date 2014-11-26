define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html'
], function (
    $,
    template,
    adFeatureMpuTpl,
    adFeatureMpuLargeTpl
) {

    /**
     * Create simple templated creatives -
     *
     *  * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     *  * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var creativeTemplates = {
            'ad-feature-mpu': adFeatureMpuTpl,
            'ad-feature-mpu-large': adFeatureMpuLargeTpl
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
