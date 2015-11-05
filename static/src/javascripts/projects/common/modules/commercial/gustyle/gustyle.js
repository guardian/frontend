define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/ui/toggles',
    'common/views/svgs',
    'text!common/views/commercial/gustyle/label.html',
    'lodash/objects/merge'
], function (
    fastdom,
    $,
    template,
    Toggles,
    svgs,
    labelTpl,
    merge) {
    var Gustyle = function ($slot, params) {
        this.$slot = $slot;
        this.params  = params;
    };

    Gustyle.prototype.addLabel = function () {
        var toggles,
            templateOptions = {
                buttonTitle: (this.params.adVariant === 'content') ?
                    'Paid Story' : 'Ad',
                infoTitle: (this.params.adVariant === 'content') ?
                    'Paid Stories' : 'Adverts',
                infoText: (this.params.adVariant === 'content') ?
                    'are paid for by a third party advertiser' : 'are paid for by a third party advertisers and link to an external site',
                infoLinkText: 'Learn how advertising supports the Guardian',
                infoLinkUrl: 'http://www.theguardian.com/sponsored-content',
                icon: svgs('arrowicon', ['gu-comlabel__icon']),
                dataAttr: this.$slot.attr('id')
            };

        fastdom.write(function () {
            this.$slot.addClass('gu-style');
            this.$slot.prepend($.create(template(labelTpl, { data: merge(templateOptions) })));

            toggles = new Toggles(this.$slot[0]);
            toggles.init();
        }.bind(this));
    };
    return Gustyle;
});
