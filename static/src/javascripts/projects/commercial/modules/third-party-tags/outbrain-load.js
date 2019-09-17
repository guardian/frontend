// @flow

import $ from 'lib/$';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { getBreakpoint } from 'lib/detect';
import { loadScript } from 'lib/load-script';
import { markTime } from 'lib/user-timing';
import { trackPerformance } from 'common/modules/analytics/google';

import { getCode } from './outbrain-codes';
import { getCode as getNewCode } from './outbrain-codes-new';
import { tracking } from './outbrain-tracking';

const outbrainUrl = '//widgets.outbrain.com/outbrain.js';
const outbrainTpl = ({ widgetCode }: { widgetCode: string }): string => `
    <div class="OUTBRAIN" data-widget-id="${widgetCode}" data-ob-template="guardian" aria-hidden="true"></div>
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

    // Add another line containing text only
    if (breakpoint !== 'mobile' && codes.text) {
        html += outbrainTpl({
            widgetCode: codes.text,
        });
    }
    return html;
};

/*
  Load the outbrain widget according to target and to the visibility of
  the contribution epic

  Valid values for target are 'defaults', 'merchandising', 'nonCompliant'

  When the target is nonCompliant, you are encouraged to pass the contributionEpicVisible
  parameter as this will have an effect on the new outbrain ID mapping (as of end 2018).

 */
const load = (
    target: string,
    contributionEpicVisible?: boolean = false
): Promise<void> => {
    const outbrainType = target && target in selectors ? target : 'defaults';
    const $outbrain = $(selectors.outbrain.widget);
    const $container = $(selectors.outbrain.container, $outbrain[0]);
    const breakpoint = getBreakpoint();

    const shouldUseNewOutbrainCodes: boolean = config.get(
        'switches.commercialOutbrainNewids',
        false
    );

    const widgetCodes = ((): {
        code?: string,
        image?: string,
        text?: string,
    } => {
        if (shouldUseNewOutbrainCodes) {
            return getNewCode({
                outbrainType,
                contributionEpicVisible,
                section: config.get('page.section', ''),
                breakpoint,
            });
        }
        return getCode({
            outbrainType,
            section: config.get('page.section', ''),
            breakpoint,
        });
    })();

    const widgetHtml = build(widgetCodes, breakpoint);

    if ($container.length) {
        return fastdom
            .write(() => {
                if (outbrainType === 'merchandising') {
                    $(selectors.merchandising.widget).replaceWith($outbrain[0]);
                }
                $container.append(widgetHtml);
                $outbrain.css('display', 'block');
            })
            .then(() => {
                tracking({
                    widgetId: widgetCodes.code || widgetCodes.image,
                });
                loadScript(outbrainUrl);
                markTime('Commercial: Outbrain loaded');
                trackPerformance(
                    'Javascript Load',
                    'commercialOutbrainLoaded',
                    'Commercial outbrain loaded'
                );
            });
    }
    return Promise.resolve();
};

export { load };
