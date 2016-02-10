define([
    'common/utils/$',
    'common/utils/config',

    // require templates, so they're bundled up as part of the build
    'template!common/views/commercial/creatives/logo-foundation-funded.html',
    'template!common/views/commercial/creatives/logo-foundation-funded-partners.html'
], function (
    $,
    config
) {

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

        require(['template!common/views/commercial/creatives/' + templateName + '.html'], function (creativeTpl) {
            var creativeHtml = creativeTpl(this.params);

            $.create(creativeHtml)
                .appendTo(this.$adSlot);
        }.bind(this));
    };

    return Template;

});
