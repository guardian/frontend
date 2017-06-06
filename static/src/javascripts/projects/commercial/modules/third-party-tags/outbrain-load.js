// @flow

import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import detect from 'lib/detect';
import { loadScript } from 'lib/load-script';
import { getCode } from './outbrain-codes';
import { tracking } from './outbrain-tracking';

const outbrainUrl = '//widgets.outbrain.com/outbrain.js';
const outbrainTpl = ({ widgetCode }: { widgetCode: string }): string => `
    <div class="OUTBRAIN" data-widget-id="${widgetCode}" data-ob-template="guardian"></div>
    `;

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

const build = (
    codes: { code?: string, image?: string, text?: string },
    breakpoint: string
): string => {
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

const load = (target?: string): Promise<void> => {
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
        return fastdom
            .write(() => {
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
    return Promise.resolve();
};

export { load };
