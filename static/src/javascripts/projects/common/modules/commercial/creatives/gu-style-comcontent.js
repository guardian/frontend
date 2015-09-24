define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/commercial/gustyle/gustyle',
    'text!common/views/commercial/creatives/gu-style-comcontent.html'
], function (
    fastdom,
    $,
    _,
    detect,
    mediator,
    template,
    svgs,
    GuStyle,
    gustyleComcontentTpl
) {

    var GustyleComcontent = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;
    };

    GustyleComcontent.prototype.create = function () {
        var externalLinkIcon = svgs('externalLink', ['gu-external-icon']),
            templateOptions = {
                clickMacro: this.params.clickMacro,
                gustyleClass: (this.params.adVariant === 'content') ?
                        'gu-comcontent' : 'gu-display',
                standFirst: (this.params.adVariant === 'content') ?
                        '<p class="gu-text">' + this.params.articleText + '</p>' : '',
                noteOrLink: (this.params.adVariant === 'content') ?
                        '<span class="gu-note">Brought to you by:</span>' : '<a href="' + this.params.articleUrl + '" class="button button--tertiary button--medium">' + this.params.linkLabel + ' ' + externalLinkIcon + '</a>'
            };

        $.create(template(gustyleComcontentTpl, { data: _.merge(this.params, templateOptions) })).appendTo(this.$adSlot);
        new GuStyle(this.$adSlot, this.params).addLabel();

        if (this.params.trackingPixel) {
            this.$adSlot.before('<img src="' + this.params.trackingPixel + this.params.cacheBuster + '" class="creative__tracking-pixel" height="1px" width="1px"/>');
        }

    };

    return GustyleComcontent;

});
