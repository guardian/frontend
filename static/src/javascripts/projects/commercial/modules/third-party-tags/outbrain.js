// @flow
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import template from 'lodash/utilities/template';
import steadyPage from 'lib/steady-page';
import getCode from 'commercial/modules/third-party-tags/outbrain-codes';
import outbrainStr from 'raw-loader!commercial/views/outbrain.html';
import { loadScript } from 'lib/load-script';
import checkMediator from 'common/modules/check-mediator';
import ophan from 'ophan/ng';

const outbrainUrl = '//widgets.outbrain.com/outbrain.js';
const outbrainTpl = template(outbrainStr);

const selectors = {
    outbrain: {
        widget: '.js-outbrain',
        container: '.js-outbrain-container',
    },
    merchandising: {
        widget: '.js-container--commercial',
        container: '.js-outbrain-container',
    },
    nonCompliant: {
        widget: '.js-outbrain',
        container: '.js-outbrain-container',
    },
};

const build = function(codes, breakpoint) {
    let html = outbrainTpl({
        widgetCode: codes.code || codes.image,
    });
    if (breakpoint !== 'mobile' && codes.text) {
        html += outbrainTpl({
            widgetCode: codes.text,
        });
    }
    return html;
};

const tracking = function(trackingObj) {
    ophan.record({
        outbrain: trackingObj,
    });
};

const load = function(target) {
    const slot = target in selectors ? target : 'defaults';
    const $outbrain = $(selectors.outbrain.widget);
    const $container = $(selectors.outbrain.container, $outbrain[0]);
    const breakpoint = detect.getBreakpoint();

    const widgetCodes = getCode({
        slot,
        section: config.page.section,
        breakpoint,
    });

    const widgetHtml = build(widgetCodes, breakpoint);

    if ($container.length) {
        return steadyPage
            .insert($container[0], () => {
                if (slot === 'merchandising') {
                    $(selectors[slot].widget).replaceWith($outbrain[0]);
                }
                $container.append(widgetHtml);
                $outbrain.css('display', 'block');
            })
            .then(() => {
                tracking({
                    widgetId: widgetCodes.code || widgetCodes.image,
                });
                loadScript(outbrainUrl);
            });
    }
};

/*
 Loading Outbrain is dependent on successful return of high relevance component
 from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
 not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
 make the call instantly when we detect adBlock in use.
*/
const canLoadInstantly = function() {
    return detect.adblockInUse.then(
        adblockInUse =>
            !document.getElementById('dfp-ad--merchandising-high') ||
            adblockInUse
    );
};

const onIsOutbrainNonCompliant = function(outbrainNonCompliant) {
    if (outbrainNonCompliant) load('nonCompliant');
    else load();
    tracking({
        state: outbrainNonCompliant ? 'nonCompliant' : 'compliant',
    });
    return Promise.resolve();
};

const onIsOutbrainMerchandiseCompliant = function(
    outbrainMerchandiseCompliant
) {
    if (outbrainMerchandiseCompliant) {
        load('merchandising');
        tracking({
            state: 'outbrainMerchandiseCompliant',
        });
        return Promise.resolve();
    }
    return checkMediator
        .waitForCheck('isOutbrainNonCompliant')
        .then(onIsOutbrainNonCompliant);
};

const onIsOutbrainBlockedByAds = function(outbrainBlockedByAds) {
    if (outbrainBlockedByAds) {
        tracking({
            state: 'outbrainBlockedByAds',
        });
        return Promise.resolve();
    }
    return checkMediator
        .waitForCheck('isOutbrainMerchandiseCompliant')
        .then(onIsOutbrainMerchandiseCompliant);
};

const onCanLoadInstantly = function(loadInstantly) {
    if (loadInstantly) {
        return checkMediator
            .waitForCheck('isOutbrainNonCompliant')
            .then(onIsOutbrainNonCompliant);
    }
    return checkMediator
        .waitForCheck('isOutbrainBlockedByAds')
        .then(onIsOutbrainBlockedByAds);
};

const onIsOutbrainDisabled = function(outbrainDisabled) {
    if (outbrainDisabled) {
        tracking({
            state: 'outbrainDisabled',
        });
        return Promise.resolve();
    }
    return canLoadInstantly().then(onCanLoadInstantly);
};

const outbrainChecks = function() {
    return checkMediator
        .waitForCheck('isOutbrainDisabled')
        .then(onIsOutbrainDisabled);
};

const init = function() {
    return outbrainChecks();
};

export default {
    load,
    tracking,
    init,
};
