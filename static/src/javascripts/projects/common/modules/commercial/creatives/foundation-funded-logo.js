define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/logo-foundation-funded.html',
    'text!common/views/commercial/creatives/logo-foundation-funded-partners.html'
], function (
    $,
    config,
    template
) {

    /**
     * Create the foundation logo
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10022127
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026327
     */
    var Template = function ($adSlot, params) {
        var capitalisedTag;

        this.$adSlot       = $adSlot;
        this.params        = params;
        if (!config.page.isFront && config.page.sponsorshipTag) {
            capitalisedTag = config.page.sponsorshipTag.replace(/(^|\s|-)[a-z]/g, function (m) {
                return m.toUpperCase();
            });
            this.params.header = 'Guardian ' + capitalisedTag + ' is supported by:';
        } else {
            this.params.header = 'Supported by:';
        }
    };

    Template.prototype.create = function () {
        var templateName = 'logo-foundation-funded' + (this.params.hasPartners ? '-partners' : '');

        require(['text!common/views/commercial/creatives/' + templateName + '.html'], function (creativeTpl) {
            var creativeHtml = template(creativeTpl, this.params);

            $.create(creativeHtml)
                .appendTo(this.$adSlot);
        }.bind(this));
    };

    return Template;

});
