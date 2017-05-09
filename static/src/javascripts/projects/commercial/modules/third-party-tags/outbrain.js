// @flow
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import steadyPage from 'lib/steady-page';
import { loadScript } from 'lib/load-script';
import checkMediator from 'projects/common/modules/check-mediator';
import ophan from 'ophan/ng';
import getCode from './outbrain-codes';

const outbrainUrl = '//widgets.outbrain.com/outbrain.js';
const outbrainTpl = ({ widgetCode }: { widgetCode: string }): string => `
    <div class="OUTBRAIN" data-widget-id="${widgetCode}" data-ob-template="guardian"></div>
    `;

const module = {};

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

const build = function(
    codes: { code?: string, image?: string, text?: string },
    breakpoint: string
): string {
    let html = outbrainTpl({
        widgetCode: codes.code || codes.image || '',
    });
    if (breakpoint !== 'mobile' && codes.text) {
        html += outbrainTpl({
            widgetCode: codes.text,
        });
    }
    return html;
};

module.tracking = function(trackingObj: {
    widgetId?: string,
    state?: string,
}): void {
    ophan.record({
        outbrain: trackingObj,
    });
};

module.load = function(target?: string): any {
    const slot = target && target in selectors ? target : 'defaults';
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
                module.tracking({
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
    if (outbrainNonCompliant) module.load('nonCompliant');
    else module.load();
    module.tracking({
        state: outbrainNonCompliant ? 'nonCompliant' : 'compliant',
    });
    return Promise.resolve();
};

const onIsOutbrainMerchandiseCompliant = function(
    outbrainMerchandiseCompliant
) {
    if (outbrainMerchandiseCompliant) {
        module.load('merchandising');
        module.tracking({
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
        module.tracking({
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
        module.tracking({
            state: 'outbrainDisabled',
        });
        return Promise.resolve();
    }
    return canLoadInstantly().then(onCanLoadInstantly);
};

module.init = function() {
    return checkMediator
        .waitForCheck('isOutbrainDisabled')
        .then(onIsOutbrainDisabled);
};

export default module;
