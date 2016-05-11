define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/commercial/creatives/template-preprocessor',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/logo.html'
], function (
    fastdom,
    $,
    template,
    templatePreprocessor,
    logoStr
) {

    /**
     * Create the foundation logo
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10022127
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026327
     */
    var Template = function (adSlot, params) {
        this.adSlot        = adSlot instanceof HTMLElement ? adSlot : adSlot[0];
        this.params        = params;
    };

    Template.prototype.create = function () {
        // var templateName = 'logo-foundation-funded' + (this.params.hasPartners ? '-partners' : '');
        templatePreprocessor.logo(this);
        var logo = template(logoStr, this.params);

        fastdom.write(function () {
            this.adSlot.insertAdjacentHTML('beforeend', logo);
        }, this);
    };

    return Template;

});
