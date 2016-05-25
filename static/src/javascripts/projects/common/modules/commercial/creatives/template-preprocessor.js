define([
    'common/views/svgs',
    'common/utils/config',
    'lodash/objects/assign',
    'lodash/utilities/identity',
    'tpl!common/views/commercial/creatives/logo-header.html',
    'tpl!common/views/commercial/creatives/logo-link.html',
    'tpl!common/views/commercial/creatives/logo-about.html',
    'tpl!common/views/commercial/creatives/manual-inline-button.html',
    'tpl!common/views/commercial/creatives/gimbap/gimbap-simple-blob.html',
    'tpl!common/views/commercial/creatives/gimbap/gimbap-richmedia-blob.html',
    'tpl!common/views/commercial/creatives/manual-card.html',
    'tpl!common/views/commercial/creatives/manual-card-large.html',
    'tpl!common/views/commercial/creatives/manual-card-cta.html',
    'tpl!common/views/commercial/creatives/manual-container-button.html',
    'tpl!common/views/commercial/creatives/manual-container-cta.html',
    'tpl!common/views/commercial/creatives/manual-container-cta-soulmates.html',
    'tpl!common/views/commercial/creatives/manual-container-cta-membership.html'
], function (
    svgs,
    config,
    assign,
    identity,
    logoHeaderTpl,
    logoLinkTpl,
    logoAboutTpl,
    manualInlineButtonTpl,
    gimbapSimpleTpl,
    gimbapRichmediaTpl,
    manualCardTpl,
    manualCardLargeTpl,
    manualCardCtaTpl,
    manualContainerButtonTpl,
    manualContainerCtaTpl,
    manualContainerCtaSoulmatesTpl,
    manualContainerCtaMembershipTpl
) {
    var manualCardTpls = {
        'manual-card': manualCardTpl,
        'manual-card-large': manualCardLargeTpl
    };

    function preprocessLogo(tpl) {
        if (tpl.params.type === 'ad-feature') {
            tpl.params.header = logoHeaderTpl({ header: 'Paid for by' });
            tpl.params.logo = logoLinkTpl(tpl.params);
            tpl.params.partners = '';
            tpl.params.aboutLink = '';
        } else if (tpl.params.type === 'sponsored') {
            tpl.params.header = logoHeaderTpl({ header: 'Supported by' });
            tpl.params.logo = logoLinkTpl(tpl.params);
            tpl.params.partners = '';
            tpl.params.aboutLink = logoAboutTpl(tpl.params);
        } else if (tpl.params.type === 'funded'){
            tpl.params.header = logoHeaderTpl({
                header: !config.page.isFront && config.page.sponsorshipTag ?
                    config.page.sponsorshipTag + ' is supported by' :
                    'Supported by'
            });
            tpl.params.logo = logoLinkTpl(tpl.params);
            tpl.params.partners = !tpl.params.hasPartners ? '' :
                logoHeaderTpl({ header: 'In partnership with:' }) +
                logoLinkTpl({
                    clickMacro: tpl.params.clickMacro,
                    logoUrl: tpl.params.partnerOneLogoUrl,
                    logoImage: tpl.params.partnerOneLogoImage }) +
                logoLinkTpl({
                    clickMacro: tpl.params.clickMacro,
                    logoUrl: tpl.params.partnerTwoLogoUrl,
                    logoImage: tpl.params.partnerTwoLogoImage });
            tpl.params.aboutLink = logoAboutTpl(tpl.params);
        }
    }

    function preprocessManualInline(tpl) {
        // having a button is the default state, that is why we expressely
        // test for when *not* to display one
        tpl.params.offerButton = tpl.params.show_button === 'no' ?
            '' :
            manualInlineButtonTpl(tpl.params);
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
        tpl.params.classNames = ['manual'].concat(tpl.params.classNames).map(function (cn) { return 'adverts--' + cn; }).join(' ');
        tpl.params.title || (tpl.params.title = '');

        if (tpl.params.isSoulmates) {
            tpl.params.title = tpl.params.marque54icon + tpl.params.logosoulmates + '<span class="u-h">The Guardian Soulmates</span>';
            tpl.params.blurb = 'Meet someone <em>worth</em> meeting';
            tpl.params.ctas = manualContainerCtaSoulmatesTpl(tpl.params);

        } else if (tpl.params.isMembership) {
            tpl.params.blurb = tpl.params.title;
            tpl.params.title = tpl.params.logomembership + '<span class="u-h">The Guardian Membership</span>';
            tpl.params.ctas = manualContainerCtaMembershipTpl(tpl.params);

        } else {
            tpl.params.title = tpl.params.marque54icon + tpl.params.logoguardian + '<span class="u-h">The Guardian</span>' + tpl.params.title;
            tpl.params.blurb = tpl.params.explainer || '';
            tpl.params.ctas = tpl.params.viewalltext ? manualContainerCtaTpl(tpl.params) : '';
        }

        if (tpl.params.type === 'multiple') {
            tpl.params.innards = [1, 2, 3, 4].map(function(index) {
                return tpl.params['offer' + index + 'url'] ? manualCardTpls[tpl.params.creativeCard]({
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
                    classNames:          [index > 2 ? 'hide-until-tablet' : ''].concat(['manual', tpl.params.toneClass.replace('commercial--tone-', '')].map(function (cn) { return 'advert--' + (stems[cn] || cn); })).join(' ')
                }) : null;
            }).filter(identity).join('');
        } else {
            tpl.params.innards = manualCardTpls[tpl.params.creativeCard]({
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
                classNames:          ['single', 'landscape', 'large', 'inverse', tpl.params.toneClass.replace('commercial--tone', '')].map(function (cn) { return 'advert--' + (stems[cn] || cn); }).join(' ')
            }) + manualContainerButtonTpl({
                baseUrl:             tpl.params.baseUrl,
                clickMacro:          tpl.params.clickMacro,
                offerLinkText:       tpl.params.offerLinkText,
                arrowRight:          tpl.params.arrowRight
            });
        }
    }

    function preprocessGimbapRichmedia(tpl) {
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
        'logo': preprocessLogo,
        'manual-inline': preprocessManualInline,
        'gimbap': preprocessGimbap,
        'gimbap-simple': preprocessGimbapSimple,
        'gimbap-richmedia': preprocessGimbapRichmedia,
        'manual-container': preprocessManualContainer
    };
});
