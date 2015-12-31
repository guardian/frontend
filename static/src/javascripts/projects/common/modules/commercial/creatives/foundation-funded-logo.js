define([
    'common/utils/$',
    'common/utils/config',
    'ldsh!common/views/commercial/creatives/logo-foundation-funded',
    'ldsh!common/views/commercial/creatives/logo-foundation-funded-partners'
], function (
    $,
    config,
    template,
    logoFoundationFundedTpl,
    logoFoundationFundedPartnersTpl
) {

    var templates = {
        'logo-foundation-funded': logoFoundationFundedTpl,
        'logo-foundation-funded-partners': logoFoundationFundedPartnersTpl
    };

    /**
     * Create the foundation logo
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10022127
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026327
     */
    var Template = function ($adSlot, params) {
        this.$adSlot       = $adSlot;
        this.params        = params;
        this.params.header = (!config.page.isFront && config.page.sponsorshipTag) ?
            config.page.sponsorshipTag + ' is supported by:' : 'Supported by:';
    };

    Template.prototype.create = function () {
        var templateName = 'logo-foundation-funded' + (this.params.hasPartners ? '-partners' : '');
        var creativeHtml = templates[templateName](this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
