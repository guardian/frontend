define([
    'common/utils/template',
    'text!common/views/commercial/creatives/manual-inline-button.html',
    'text!common/views/commercial/creatives/manual-single-button.html',
    'text!common/views/commercial/creatives/manual-multiple-button.html',

    'text!common/views/commercial/creatives/manual-title.html'
], function (
    template,
    manualInlineButtonStr,
    manualSingleButtonStr,
    manualMultipleButtonStr,

    manualTitleStr
) {
    var manualInlineButtonTpl;
    var manualSingleButtonTpl;
    var manualMultipleButtonTpl;
    var manualTitleTpl;

    function preprocessManualInline(tpl) {
        if (!manualInlineButtonTpl) {
            manualInlineButtonTpl = template(manualInlineButtonStr);
        }
        // having a button is the default state, that is why we expressely
        // test for when *not* to display one
        tpl.params.offerButton = tpl.params.show_button === 'no' ?
            '' :
            manualInlineButtonTpl(tpl.params);
    }

    function preprocessManualSingle(tpl) {
        if (!manualSingleButtonTpl) {
            manualSingleButtonTpl = template(manualSingleButtonStr);
        }

        if (!manualTitleTpl) {
            manualTitleTpl = template(manualTitleStr);
        }

        tpl.params.offerButtonTemplate = (tpl.params.offerLinkText) ?
             manualSingleButtonTpl(tpl.params) :
             '';

        tpl.params.offerTitleTemplate = tpl.params.offerTitle ?
             manualTitleTpl(tpl.params) :
             '';
    }

    function preprocessManualMultiple(tpl) {
        if (!manualMultipleButtonTpl) {
            manualMultipleButtonTpl = template(manualMultipleButtonStr);
        }

        if (!manualTitleTpl) {
            manualTitleTpl = template(manualTitleStr);
        }

        var links = ['offer1linktext', 'offer2linktext', 'offer3linktext', 'offer4linktext'];
        for (var i = 0; i < links.length; i++) {
            tpl.params['offer' + (i + 1) + 'ButtonTemplate'] = (tpl.params.offerlinktext || tpl.params[links[i]]) ?
                manualMultipleButtonTpl({
                    offerlinktext: tpl.params[links[i]] || tpl.params.offerlinktext,
                    arrowRight: tpl.params.arrowRight
                }) :
                '';
        }

        var titles = ['offer1title', 'offer2title', 'offer3title', 'offer4title'];
        for (var j = 0; j < titles.length; j++) {
            tpl.params['offer' + (j + 1) + 'TitleTemplate'] = tpl.params[titles[j]] ?
                manualTitleTpl({
                    offerTitle: tpl.params[titles[j]]
                }) :
                '';
        }
    }

    function preprocessGimbap(tpl) {
        tpl.params.headless = tpl.params.headless === 'true';
    }

    return {
        'manual-inline': preprocessManualInline,
        'manual-single': preprocessManualSingle,
        'manual-multiple': preprocessManualMultiple,
        'gimbap': preprocessGimbap
    };
});
