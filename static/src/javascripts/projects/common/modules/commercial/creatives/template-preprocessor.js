define([
    'common/views/svgs',
    'common/utils/template',
    'lodash/objects/assign',
    'text!common/views/commercial/creatives/manual-inline-button.html',
    'text!common/views/commercial/creatives/manual-single-button.html',
    'text!common/views/commercial/creatives/manual-multiple-button.html',
    'text!common/views/commercial/creatives/manual-title.html',
    'text!common/views/commercial/creatives/gimbap/gimbap-simple-blob.html',
    'text!common/views/commercial/creatives/manual-card.html',
    'text!common/views/commercial/creatives/manual-card-large.html',
    'text!common/views/commercial/creatives/manual-container-button.html',
    'text!common/views/commercial/creatives/manual-container-cta.html',
    'text!common/views/commercial/creatives/manual-container-cta-soulmates.html',
    'text!common/views/commercial/creatives/manual-container-cta-membership.html'
], function (
    svgs,
    template,
    assign,
    manualInlineButtonStr,
    manualSingleButtonStr,
    manualMultipleButtonStr,
    manualTitleStr,
    gimbapSimpleStr,
    manualCardStr,
    manualCardLargeStr,
    manualContainerButtonStr,
    manualContainerCtaStr,
    manualContainerCtaSoulmatesStr,
    manualContainerCtaMembershipStr
) {
    var manualInlineButtonTpl;
    var manualSingleButtonTpl;
    var manualMultipleButtonTpl;
    var manualTitleTpl;
    var gimbapSimpleTpl;
    var manualCardStrs = {
        'manual-card': manualCardStr,
        'manual-card-large': manualCardLargeStr
    };
    var manualCardTpls = {};
    var manualContainerButtonTpl;
    var manualContainerCtaTpl;
    var manualContainerCtaSoulmatesTpl;
    var manualContainerCtaMembershipTpl;

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

        // SVGs
        tpl.params.marque36icon = svgs('marque36icon', ['gimbap-wrap__mainlogo']);
        tpl.params.inlineQuote = svgs('quoteIcon', ['gimbap__quote']);
        tpl.params.arrowRight = (tpl.params.linksWithArrows.indexOf('yes') !== -1) ? svgs('arrowRight', ['gimbap__arrow']) : '';

        // Make sure we include right logo to the right card
        tpl.params.offer1logo = tpl.params['logo' + tpl.params.offer1tone + 'horizontal'];
        tpl.params.offer2logo = tpl.params['logo' + tpl.params.offer2tone + 'horizontal'];
        tpl.params.offer3logo = tpl.params['logo' + tpl.params.offer3tone + 'horizontal'];
        tpl.params.offer4logo = tpl.params['logo' + tpl.params.offer4tone + 'horizontal'];

        tpl.params.gimbapLogoStyle = (tpl.params.style === 'reversed') ? ' gimbap-logo--reversed': '';

        // Include quotes into title only if it is allowed in DFP line item
        tpl.params.offer1HasQuotes = (tpl.params.offer1quotes.indexOf('yes') !== -1) ? tpl.params.inlineQuote : '';
        tpl.params.offer2HasQuotes = (tpl.params.offer2quotes.indexOf('yes') !== -1) ? tpl.params.inlineQuote : '';
        tpl.params.offer3HasQuotes = (tpl.params.offer3quotes.indexOf('yes') !== -1) ? tpl.params.inlineQuote : '';
        tpl.params.offer4HasQuotes = (tpl.params.offer4quotes.indexOf('yes') !== -1) ? tpl.params.inlineQuote : '';

        // Test for Author image
        tpl.params.hasAuthorImage = tpl.params.offer1authorimage
                                        && tpl.params.offer1authorimage.length > 0
                                        && tpl.params.layout !== '1x1x1x1';
    }

    function preprocessGimbapSimple(tpl) {
        if (!gimbapSimpleTpl) {
            gimbapSimpleTpl = template(gimbapSimpleStr);
        }
        // SVGs
        tpl.params.marque36icon = svgs('marque36icon', ['gimbap-wrap__mainlogo']);
        tpl.params.arrowRight = (tpl.params.linksWithArrows.indexOf('yes') !== -1) ? svgs('arrowRight', ['gimbap__arrow', 'gimbap__arrow--styled']) : '';
        tpl.params.logo = tpl.params['logo' + tpl.params.componenttone + 'horizontal'];

        tpl.params.gimbapEffects = tpl.params.componenteffects === 'yes' ? ' ' + 'gimbap--effects' : '';

        tpl.params.gimbapSimple = '';
        for (var i = 1; i <= 4; i++) {
            tpl.params.gimbapSimple += gimbapSimpleTpl(assign(tpl.params, {
                offerurl: tpl.params['offer' + i + 'url'],
                offertitle: tpl.params['offer' + i + 'title'],
                offerimage: tpl.params['offer' + i + 'image']
            }));
        }
    }

    function preprocessManualContainer(tpl) {
        manualContainerButtonTpl || (manualContainerButtonTpl = template(manualContainerButtonStr));
        manualCardTpls[tpl.params.creativeCard] || (manualCardTpls[tpl.params.creativeCard] = template(manualCardStrs[tpl.params.creativeCard]));
        tpl.params.classNames = tpl.params.classNames.map(function (cn) { return 'adverts--' + cn; }).join(' ');
        tpl.params.title || (tpl.params.title = '');
        if (tpl.params.isSoulmates) {
            manualContainerCtaSoulmatesTpl || (manualContainerCtaSoulmatesTpl = template(manualContainerCtaSoulmatesStr));
            tpl.params.title = tpl.params.marque54icon + tpl.params.logosoulmates + '<span class="u-h">The Guardian Soulmates</span>';
            tpl.params.blurb = 'Meet someone <em>worth</em> meeting';
            tpl.params.ctas = manualContainerCtaSoulmatesTpl(tpl.params);
        } else if (tpl.params.isMembership) {
            manualContainerCtaMembershipTpl || (manualContainerCtaMembershipTpl = template(manualContainerCtaMembershipStr));
            tpl.params.blurb = tpl.params.title;
            tpl.params.title = tpl.params.logomembership + '<span class="u-h">The Guardian Membership</span>';
            tpl.params.ctas = manualContainerCtaMembershipTpl(tpl.params);
        } else {
            manualContainerCtaTpl || (manualContainerCtaTpl = template(manualContainerCtaStr));
            tpl.params.title = tpl.params.marque54icon + tpl.params.logoguardian + '<span class="u-h">The Guardian</span>' + tpl.params.title;
            tpl.params.blurb = tpl.params.explainer || '';
            tpl.params.ctas = tpl.params.viewalltext ? manualContainerCtaTpl(tpl.params) : '';
        }
        if (tpl.params.originalCreative === 'manual-multiple') {
            tpl.params.innards = [1, 2, 3, 4].map(function(index) {
                return manualCardTpls[tpl.params.creativeCard]({
                    clickMacro:          tpl.params.clickMacro,
                    offerUrl:            tpl.params['offer' + index + 'url'],
                    offerImage:          tpl.params['offer' + index + 'image'],
                    offerTitle:          tpl.params['offer' + index + 'title'],
                    offerText:           tpl.params['offer' + index + 'meta'],
                    offerLinkText:       tpl.params['offer' + index + 'linktext'] || tpl.params.offerLinkText,
                    arrowRight:          tpl.params.arrowRight,
                    classNames:          [tpl.params.toneClass.replace('commercial--tone-', '')].map(function (cn) { return 'advert--' + cn; }).join(' ')
                });
            }).join('');
        } else {
            tpl.params.innards = manualCardTpls[tpl.params.creativeCard]({
                clickMacro:          tpl.params.clickMacro,
                offerUrl:            tpl.params.offerUrl,
                offerImage:          tpl.params.offerImage,
                offerTitle:          tpl.params.offerTitle,
                offerText:           tpl.params.offerText,
                offerLinkText:       tpl.params.offerlinktext,
                arrowRight:          tpl.params.arrowRight,
                classNames:          ['landscape', 'large', 'inverse', tpl.params.toneClass.replace('commercial--tone', '')].map(function (cn) { return 'advert--' + cn; }).join(' ')
            }) + manualContainerButtonTpl(tpl.params);
        }
    }

    return {
        'manual-inline': preprocessManualInline,
        'manual-single': preprocessManualSingle,
        'manual-multiple': preprocessManualMultiple,
        'gimbap': preprocessGimbap,
        'gimbap-simple': preprocessGimbapSimple,
        'manual-container': preprocessManualContainer
    };
});
