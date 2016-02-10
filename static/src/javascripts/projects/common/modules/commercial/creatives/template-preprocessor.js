define([
    'template!common/views/commercial/creatives/manual-inline-button.html',
    'template!common/views/commercial/creatives/manual-single-button.html',
    'template!common/views/commercial/creatives/manual-multiple-button.html'
], function (
    manualInlineButtonTpl,
    manualSingleButtonTpl,
    manualMultipleButtonTpl
) {
    function preprocessManualInline(tpl) {
        // having a button is the default state, that is why we expressely
        // test for when *not* to display one
        tpl.params.offerButton = tpl.params.show_button === 'no' ?
            '' :
            manualInlineButtonTpl(tpl.params);
    }

    function preprocessManualSingle(tpl) {
        tpl.params.offerButton = (tpl.params.offerLinkText) ?
             manualSingleButtonTpl(tpl.params) :
             '';
    }

    function preprocessManualMultiple(tpl) {
        var links = ['offer1linktext', 'offer2linktext', 'offer3linktext', 'offer4linktext'];
        for (var i = 0; i < links.length; i++) {
            tpl.params['offer' + (i + 1) + 'Button'] = (tpl.params.offerlinktext || tpl.params[links[i]]) ?
                manualMultipleButtonTpl({
                    offerlinktext: tpl.params[links[i]] || tpl.params.offerlinktext,
                    arrowRight: tpl.params.arrowRight
                }) :
                '';
        }
    }

    return {
        'manual-inline': preprocessManualInline,
        'manual-single': preprocessManualSingle,
        'manual-multiple': preprocessManualMultiple
    };
});
