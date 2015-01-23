define([
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
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

    /**
     * Create simple templated creatives
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    params.marque_36_icon = svgs.marque_36_icon;
    params.marque_36_icon_creative__marque = svgs.marque_36_icon_creative__marque;

    Template.prototype.create = function () {
        require(['text!common/views/commercial/creatives/' + this.params.creative + '.html'], function (creativeTpl) {
            var creativeHtml = template(creativeTpl, this.params);

            $.create(creativeHtml)
                .appendTo(this.$adSlot);
        }.bind(this));
    };

    return Template;

});
