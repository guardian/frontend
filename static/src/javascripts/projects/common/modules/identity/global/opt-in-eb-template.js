// @flow

import { inlineSvg } from 'common/views/svgs';

type Template = {
    image: string,
    title: string,
    cta: string,
    remindMeLater: string,
    messageCloseBtn: string,
};

type LinkTargets = {
    landing: string,
};

const makeTemplateHtml = (template: Template, targets: LinkTargets): string => `
    <div id="site-message__message">
        <div class="site-message__message identity-gdpr-oi-alert">
            <a class="identity-gdpr-oi-alert__logo" target="_blank" href="${
                targets.landing
            }" data-link-name="gdpr-oi-campaign : alert : to-landing-img">
                <img src="${template.image}" alt="Stay with us" />
            </a>
            <div class="identity-gdpr-oi-alert__body">
                <div class="identity-gdpr-oi-alert__text">
                    ${template.title}
                </div>
                <div class="identity-gdpr-oi-alert__cta-space">
                    <a class="identity-gdpr-oi-alert__cta" target="_blank" href="${
                        targets.landing
                    }" data-link-name="gdpr-oi-campaign : alert : to-landing-cta">
                        ${template.cta}
                        ${inlineSvg('arrowRight')}
                    </a>
                    <a href="#" data-link-name="gdpr-oi-campaign : alert : remind-me-later" class="identity-gdpr-oi-alert__cta identity-gdpr-oi-alert__cta--sub ${
                        template.messageCloseBtn
                    }">
                        ${template.remindMeLater}
                    </a>
                </div>
            </div>
        </div>
    </div>`;

export type { Template, LinkTargets };
export { makeTemplateHtml };
