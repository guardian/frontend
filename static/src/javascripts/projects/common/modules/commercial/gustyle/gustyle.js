define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/modules/ui/toggles',
    'common/views/svgs',
    'text!common/views/commercial/gustyle/label.html',
    'lodash/objects/merge'
], function (
    fastdom,
    $,
    config,
    template,
    Toggles,
    svgs,
    labelTpl,
    merge
) {
    var Gustyle = function ($slot, params) {
        this.$slot = $slot;
        this.params = params;
        this.isContentPage = !!config.page.isContent;
    };

    Gustyle.prototype.addLabel = function () {
        var toggles,
            templateOptions = {
                buttonTitle: 'Ad',
                infoTitle: 'Advertising',
                infoText: 'is created and paid for by third parties and link to an external site',
                infoLinkText: 'Learn how advertising supports the Guardian',
                infoLinkUrl: 'http://www.theguardian.com/sponsored-content',
                icon: svgs('arrowicon', ['gu-comlabel__icon']),
                dataAttr: this.$slot.attr('id')
            };

        fastdom.write(function () {
            var classList = 'gu-style' + ((this.isContentPage) ? ' gu-style--unboxed' : '');

            this.$slot.addClass(classList);
            this.$slot.prepend($.create(template(labelTpl, { data: merge(templateOptions) })));

            toggles = new Toggles(this.$slot[0]);
            toggles.init();
        }.bind(this));
    };

    return Gustyle;
});
