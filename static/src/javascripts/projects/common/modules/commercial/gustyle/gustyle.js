define([
    'common/utils/fastdom-promise',
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
            // Temporary taking this off as we need to some big updates but it needs some proper thinking time and these ads needs to run today. Haha I know what you think.
            // But seriously we will do it. Eventually. Maybe. We will.
            // this.$slot.prepend($.create(template(labelTpl, { data: merge(templateOptions) })));

            // toggles = new Toggles(this.$slot[0]);
            // toggles.init();
        }, this);
    };

    return Gustyle;
});
