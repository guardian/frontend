define([
    'common/views/svgs',
    'common/utils/config',
    'common/utils/template',
    'lodash/objects/assign',
    'lodash/utilities/identity',
    'text!commercial/views/creatives/gimbap/gimbap-simple-blob.html',
    'text!commercial/views/creatives/gimbap/gimbap-richmedia-blob.html',
    'text!commercial/views/creatives/manual-card.html',
    'text!commercial/views/creatives/manual-card-large.html',
    'text!commercial/views/creatives/manual-card-cta.html',
    'text!commercial/views/creatives/manual-container-button.html',
    'text!commercial/views/creatives/manual-container-cta.html',
    'text!commercial/views/creatives/manual-container-cta-soulmates.html',
    'text!commercial/views/creatives/manual-container-cta-membership.html'
], function (
    svgs,
    config,
    template,
    assign,
    identity,
    gimbapSimpleStr,
    gimbapRichmediaStr,
    manualCardStr,
    manualCardLargeStr,
    manualCardCtaStr,
    manualContainerButtonStr,
    manualContainerCtaStr,
    manualContainerCtaSoulmatesStr,
    manualContainerCtaMembershipStr
) {
    var gimbapSimpleTpl;
    var gimbapRichmediaTpl;
    var manualCardStrs = {
        'manual-card': manualCardStr,
        'manual-card-large': manualCardLargeStr
    };
    var manualCardTpls = {};
    var manualCardCtaTpl;
    var manualContainerButtonTpl;
    var manualContainerCtaTpl;
    var manualContainerCtaSoulmatesTpl;
    var manualContainerCtaMembershipTpl;

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
        var stems = {
            jobs: 'job',
            books: 'book',
            masterclasses: 'masterclass',
            travels: 'travel',
            soulmates: 'soulmate',
            subscriptions: 'subscription',
            networks: 'network'
        };
        manualContainerButtonTpl || (manualContainerButtonTpl = template(manualContainerButtonStr));
        manualCardTpls['manual-card'] || (manualCardTpls['manual-card'] = template(manualCardStrs['manual-card']));
        manualCardTpls['manual-card-large'] || (manualCardTpls['manual-card-large'] = template(manualCardStrs['manual-card-large']));
        manualCardCtaTpl || (manualCardCtaTpl = template(manualCardCtaStr));
        tpl.params.classNames = ['manual'].concat(tpl.params.classNames).map(function (cn) { return 'adverts--' + cn; }).join(' ');
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
            tpl.params.ctas = tpl.params.type === 'inline' ? null : manualContainerCtaMembershipTpl(tpl.params);
        } else if (tpl.params.type !== 'inline'){
            manualContainerCtaTpl || (manualContainerCtaTpl = template(manualContainerCtaStr));
            tpl.params.title = tpl.params.marque54icon + tpl.params.logoguardian + '<span class="u-h">The Guardian</span>' + tpl.params.title;
            tpl.params.blurb = tpl.params.explainer || '';
            tpl.params.ctas = tpl.params.viewalltext ? manualContainerCtaTpl(tpl.params) : '';

        } else {
            tpl.params.title = tpl.params.marque36icon + tpl.params.component_title;
            tpl.params.blurb = tpl.params.ctas = '';
        }

        if (tpl.params.type === 'multiple') {
            tpl.params.row = true;
            tpl.params.innards = [1, 2, 3, 4].map(function(index) {
                var classNames = ['manual', tpl.params.toneClass.replace('commercial--tone-', '')]
                        .concat(tpl.params.prominent && index === 1 ? ['large', 'landscape', 'inverse', 'large--1x2'] : []);
                return tpl.params['offer' + index + 'url'] ? manualCardTpls[tpl.params.prominent && index === 1 ? 'manual-card-large' : 'manual-card']({
                    clickMacro:          tpl.params.clickMacro,
                    offerUrl:            tpl.params['offer' + index + 'url'],
                    offerImage:          tpl.params['offer' + index + 'image'],
                    offerTitle:          tpl.params['offer' + index + 'title'],
                    offerText:           tpl.params['offer' + index + 'meta'],
                    cta:                 tpl.params.showCtaLink !== 'hide-cta-link' && (tpl.params['offer' + index + 'linktext'] || tpl.params.offerLinkText) ? manualCardCtaTpl({
                        offerLinkText:       tpl.params['offer' + index + 'linktext'] || tpl.params.offerLinkText,
                        arrowRight:          tpl.params.arrowRight,
                        classNames:          ''
                    }) : '',
                    classNames:          classNames.map(getStem).concat(index > 2 ? ['hide-until-tablet'] : []).join(' ')
                }) : null;
            }).filter(identity).join('');
        } else if (tpl.params.type === 'single') {
            tpl.params.row = true;
            tpl.params.innards = manualCardTpls['manual-card-large']({
                clickMacro:          tpl.params.clickMacro,
                offerUrl:            tpl.params.offerUrl,
                offerImage:          tpl.params.offerImage,
                offerTitle:          tpl.params.offerTitle,
                offerText:           tpl.params.offerText,
                cta:                 tpl.params.showCtaLink !== 'hide-cta-link' && tpl.params.viewAllText ? manualCardCtaTpl({
                    offerLinkText:       tpl.params.viewAllText,
                    arrowRight:          tpl.params.arrowRight,
                    classNames:          'button--tertiary'
                }) : '',
                classNames:          ['single', 'landscape', 'large', 'inverse', tpl.params.toneClass.replace('commercial--tone-', '')].map(getStem).join(' ')
            }) + manualContainerButtonTpl({
                baseUrl:             tpl.params.baseUrl,
                clickMacro:          tpl.params.clickMacro,
                offerLinkText:       tpl.params.offerLinkText,
                arrowRight:          tpl.params.arrowRight
            });
        } else {
            tpl.params.row = false;
            tpl.params.innards = manualCardTpls['manual-card']({
                clickMacro:          tpl.params.clickMacro,
                offerUrl:            tpl.params.offerUrl,
                offerImage:          tpl.params.offerImage,
                offerTitle:          tpl.params.offerTitle,
                offerText:           tpl.params.offerText,
                cta:                 tpl.params.show_button === 'no' ? '' : manualCardCtaTpl({
                    offerLinkText:       'Click here',
                    arrowRight:          tpl.params.arrowRight,
                    classNames:          'button--primary'
                }),
                classNames:          ['inline', tpl.params.toneClass.replace('commercial--tone-', '')].map(getStem).join(' ')
            });
        }

        function getStem(cn) {
            return 'advert--' + (stems[cn] || cn);
        }
    }

    function preprocessGimbapRichmedia(tpl) {
        if (!gimbapRichmediaTpl) {
            gimbapRichmediaTpl = template(gimbapRichmediaStr);
        }
        // SVGs
        tpl.params.marque36icon = svgs('marque36icon', ['gimbap-wrap__mainlogo']);
        tpl.params.logo = tpl.params['logo' + tpl.params.componenttone + 'horizontal'];
        tpl.params.iconClock = svgs('iconClock', ['gimbap-richmedia__icon']);
        tpl.params.iconLocation = svgs('iconLocation', ['gimbap-richmedia__icon']);
        tpl.params.iconBasket = svgs('iconBasket', ['gimbap-richmedia__icon']);

        tpl.params.gimbapEffects = tpl.params.componenteffects === 'yes' ? ' ' + 'gimbap--effects' : '';

        tpl.params.gimbapRichmedia = '';
        for (var i = 1; i <= 2; i++) {
            tpl.params.gimbapRichmedia += gimbapRichmediaTpl(assign(tpl.params, {
                offerurl: tpl.params['offer' + i + 'url'],
                offertitle: tpl.params['offer' + i + 'title'],
                offerimage: tpl.params['offer' + i + 'image'],
                offerHighlight: tpl.params['offer' + i + 'highlight'],
                offerTitle: tpl.params['offer' + i + 'title'],
                offerHeadline: tpl.params['offer' + i + 'headline'],
                offerDate: tpl.params['offer' + i + 'date'],
                offerPlace: tpl.params['offer' + i + 'place'],
                offerPrice: tpl.params['offer' + i + 'price'] !== '0' ? tpl.params['offer' + i + 'price'] : '',
                offerDiscount: tpl.params['offer' + i + 'discount']
            }));
        }
    }

    return {
        'gimbap': preprocessGimbap,
        'gimbap-simple': preprocessGimbapSimple,
        'gimbap-richmedia': preprocessGimbapRichmedia,
        'manual-container': preprocessManualContainer
    };
});
