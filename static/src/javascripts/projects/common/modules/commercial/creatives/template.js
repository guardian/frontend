define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html'
], function (
    $,
    template,
    adFeatureMpuLargeTpl
) {

    /**
     * Generic template creative -
     *  * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    Template.prototype.create = function () {
        $.create(template(adFeatureMpuLargeTpl, this.params))
            .appendTo(this.$adSlot);
    };

    return Template;

});
