import Promise from 'Promise';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import template from 'lodash/utilities/template';
import steadyPage from 'lib/steady-page';
import getCode from 'commercial/modules/third-party-tags/outbrain-codes';
import outbrainStr from 'raw-loader!commercial/views/outbrain.html';
import loadScript from 'lib/load-script';
import checkMediator from 'common/modules/check-mediator';
import ophan from 'ophan/ng';
var outbrainUrl = '//widgets.outbrain.com/outbrain.js';
var outbrainTpl = template(outbrainStr);

var selectors = {
    outbrain: {
        widget: '.js-outbrain',
        container: '.js-outbrain-container'
    },
    merchandising: {
        widget: '.js-container--commercial',
        container: '.js-outbrain-container'
    },
    nonCompliant: {
        widget: '.js-outbrain',
        container: '.js-outbrain-container'
    }
};

function build(codes, breakpoint) {
    var html = outbrainTpl({
        widgetCode: codes.code || codes.image
    });
    if (breakpoint !== 'mobile' && codes.text) {
        html += outbrainTpl({
            widgetCode: codes.text
        });
    }
    return html;
}

var module = {
    load: load,
    tracking: tracking,
    init: init
};

function load(target) {
    var slot = target in selectors ? target : 'defaults';
    var $outbrain = $(selectors.outbrain.widget);
    var $container = $(selectors.outbrain.container, $outbrain[0]);
    var breakpoint = detect.getBreakpoint();
    var widgetCodes, widgetHtml;

    widgetCodes = getCode({
        slot: slot,
        section: config.page.section,
        breakpoint: breakpoint
    });

    widgetHtml = build(widgetCodes, breakpoint);

    if ($container.length) {
        return steadyPage.insert($container[0], function() {
            if (slot === 'merchandising') {
                $(selectors[slot].widget).replaceWith($outbrain[0]);
            }
            $container.append(widgetHtml);
            $outbrain.css('display', 'block');
        }).then(function() {
            module.tracking({
                widgetId: widgetCodes.code || widgetCodes.image
            });
            loadScript.loadScript(outbrainUrl);
        });
    }
}

function tracking(trackingObj) {
    ophan.record({
        outbrain: trackingObj
    });
}

/*
 Loading Outbrain is dependent on successful return of high relevance component
 from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
 not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
 make the call instantly when we detect adBlock in use.
*/
function canLoadInstantly() {
    return detect.adblockInUse.then(function(adblockInUse) {
        return !document.getElementById('dfp-ad--merchandising-high') ||
            adblockInUse;
    });
}

function onIsOutbrainDisabled(outbrainDisabled) {
    if (outbrainDisabled) {
        module.tracking({
            state: 'outbrainDisabled'
        });
        return Promise.resolve();
    } else {
        return canLoadInstantly().then(onCanLoadInstantly);
    }
}

function onCanLoadInstantly(loadInstantly) {
    if (loadInstantly) {
        return checkMediator.waitForCheck('isOutbrainNonCompliant').then(onIsOutbrainNonCompliant);
    } else {
        return checkMediator.waitForCheck('isOutbrainBlockedByAds').then(onIsOutbrainBlockedByAds);
    }
}

function onIsOutbrainNonCompliant(outbrainNonCompliant) {
    outbrainNonCompliant ? module.load('nonCompliant') : module.load();
    module.tracking({
        state: outbrainNonCompliant ? 'nonCompliant' : 'compliant'
    });
    return Promise.resolve();
}

function onIsOutbrainBlockedByAds(outbrainBlockedByAds) {
    if (outbrainBlockedByAds) {
        module.tracking({
            state: 'outbrainBlockedByAds'
        });
        return Promise.resolve();
    } else {
        return checkMediator.waitForCheck('isOutbrainMerchandiseCompliant').then(onIsOutbrainMerchandiseCompliant);
    }
}

function onIsOutbrainMerchandiseCompliant(outbrainMerchandiseCompliant) {
    if (outbrainMerchandiseCompliant) {
        module.load('merchandising');
        module.tracking({
            state: 'outbrainMerchandiseCompliant'
        });
        return Promise.resolve();
    } else {
        return checkMediator.waitForCheck('isOutbrainNonCompliant').then(onIsOutbrainNonCompliant);
    }
}

function outbrainChecks() {
    return checkMediator.waitForCheck('isOutbrainDisabled').then(onIsOutbrainDisabled);
}

function init() {
    return outbrainChecks();
}

export default module;
