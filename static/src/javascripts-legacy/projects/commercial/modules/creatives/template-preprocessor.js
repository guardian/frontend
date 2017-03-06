define([
    'lib/template',
    'lodash/utilities/identity',
    'raw-loader!commercial/views/creatives/manual-card.html',
    'raw-loader!commercial/views/creatives/manual-card-large.html',
    'raw-loader!commercial/views/creatives/manual-card-cta.html',
    'raw-loader!commercial/views/creatives/manual-container-button.html',
    'raw-loader!commercial/views/creatives/manual-container-cta.html',
    'raw-loader!commercial/views/creatives/manual-container-cta-membership.html'
], function (
    template,
    identity,
    manualCardStr,
    manualCardLargeStr,
    manualCardCtaStr,
    manualContainerButtonStr,
    manualContainerCtaStr,
    manualContainerCtaMembershipStr
) {
    var manualCardStrs = {
        'manual-card': manualCardStr,
        'manual-card-large': manualCardLargeStr
    };
    var manualCardTpls = {};
    var manualCardCtaTpl;
    var manualContainerButtonTpl;
    var manualContainerCtaTpl;
    var manualContainerCtaMembershipTpl;

    function preprocessManualContainer(tpl) {
        var stems = {
            jobs: 'job',
            books: 'book',
            masterclasses: 'masterclass',
            travels: 'travel',
            subscriptions: 'subscription',
            networks: 'network'
        };
        manualContainerButtonTpl || (manualContainerButtonTpl = template(manualContainerButtonStr));
        manualCardTpls['manual-card'] || (manualCardTpls['manual-card'] = template(manualCardStrs['manual-card']));
        manualCardTpls['manual-card-large'] || (manualCardTpls['manual-card-large'] = template(manualCardStrs['manual-card-large']));
        manualCardCtaTpl || (manualCardCtaTpl = template(manualCardCtaStr));
        tpl.params.classNames = ['manual'].concat(tpl.params.classNames).map(function (cn) { return 'adverts--' + cn; }).join(' ');
        tpl.params.title || (tpl.params.title = '');

        if (tpl.params.isMembership) {
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

    return {
        'manual-container': preprocessManualContainer
    };
});
