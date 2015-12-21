define([
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/ui/toggles',
    'common/views/svgs',
    'text!common/views/commercial/gustyle/label.html'
], function (
    fastdom,
    $,
    template,
    Toggles,
    svgs,
    labelTpl
) {

    function guStyle($adSlot, params) {
        var templateOptions = {
                buttonTitle: (params.adVariant === 'content') ?
                    'Paid Content' : 'Ad',
                infoTitle: (params.adVariant === 'content') ?
                    'Paid stories are paid for and controlled by an advertiser' : 'Adverts',
                infoText: (params.adVariant === 'content') ?
                    '' : 'are paid for by a third party advertisers and link to an external site',
                infoLinkText: 'Learn more about the Guardian’s funding from outside parties',
                infoLinkUrl: 'https://www.theguardian.com/info/2014/sep/23/paid-for-content',
                icon: svgs('arrowicon', ['gu-comlabel__icon']),
                dataAttr: $adSlot.attr('id')
            };

        fastdom.write(function () {
            $adSlot.addClass('gu-style');
            $adSlot.prepend($.create(template(labelTpl, templateOptions)));
            new Toggles($adSlot[0]).init();
        }.bind(this));
    }

    return guStyle;
});
