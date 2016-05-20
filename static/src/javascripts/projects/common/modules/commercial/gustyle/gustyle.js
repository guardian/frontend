define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/config',
    'common/modules/ui/toggles',
    'common/views/svgs',
    'template!common/views/commercial/gustyle/label.html',
    'lodash/objects/merge'
], function (
    fastdom,
    $,
    config,
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
                infoTitle: 'Advertising on the Guardian',
                infoText: 'is created and paid for by third parties and link to an external site.',
                infoLinkText: 'Learn more about how advertising supports the Guardian.',
                infoLinkUrl: 'https://www.theguardian.com/advertising-on-the-guardian',
                icon: svgs('arrowicon', ['gu-comlabel__icon']),
                dataAttr: this.$slot.attr('id')
            };

        return fastdom.write(function () {
            var classList = 'gu-style' + ((this.isContentPage) ? ' gu-style--unboxed' : '');

            this.$slot.addClass(classList);
            this.$slot.prepend($.create(labelTpl({ data: merge(templateOptions) })));

            toggles = new Toggles(this.$slot[0]);
            toggles.init();
        }, this);
    };

    return Gustyle;
});
