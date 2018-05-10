// @flow
import arrowRight from 'svgs/icon/arrow-right.svg';
import close from 'svgs/icon/close.svg';

import { bindableClassNames } from './template';
import type { MainTemplate, Feature } from './template';

const wrapLineBreakingString = (text: string[], className: string): string =>
    text
        .map(
            (line, index) =>
                `<span class="${className}">${line}${
                    index === text.length ? '' : ' '
                }</span><wbr>
    `
        )
        .join('');

export const makeTemplateHtml = (tpl: MainTemplate): string => `
<div data-link-name="sign-in-eb : dismiss" class="site-message--sign-in__overlay ${
    bindableClassNames.closeBtn
}"></div>
<div id="site-message__message" class="site-message--sign-in-container">
    <section class="site-message__message site-message__message--sign-in">
        <div class="site-message--sign-in__header">
            <h2 class="site-message--sign-in__header-msg site-message--sign-in__header-msg--main">${wrapLineBreakingString(
                tpl.headerMain,
                'site-message--sign-in__header-msg-line'
            )}</h2>
            <p class="site-message--sign-in__header-msg site-message--sign-in__header-msg--sub">${wrapLineBreakingString(
                tpl.headerSub,
                'site-message--sign-in__header-msg-line'
            )}</p>
        </div>
        <hr />
        <ul class="site-message--sign-in__body">
            ${tpl.features
                .map(
                    (feature: Feature) => `
                    <li class="site-message--sign-in__feature">
                        <strong>${feature.mainCopy}</strong>
                        ${feature.subCopy}
                        ${
                            feature.icon
                                ? `
                            <div aria-hidden="true" class="site-message--sign-in__feature-icon">
                                ${feature.icon}
                            </div>
                            `
                                : ''
                        }
                    </li>`
                )
                .join('')}
        </ul>
        <div class="site-message--sign-in__buttons">
            <a href="${
                tpl.links.signIn
            }" data-link-name="sign-in-eb : success : to-sign-in" class="site-message--sign-in-cta site-message--sign-in-cta--main">
                ${tpl.signInCta}
                ${arrowRight.markup}
            </a>
            <a href="${
                tpl.links.register
            }" data-link-name="sign-in-eb : success : to-register" class="site-message--sign-in-cta site-message--sign-in-cta--secondary">
                ${tpl.registerCta}
                ${arrowRight.markup}
            </a>
        </div>
        ${
            tpl.links.why
                ? `
            <a href="${
                tpl.links.why
            }" data-link-name="sign-in-eb : to-info" class="site-message--sign-in__why">
                ${tpl.advantagesCta}
            </a>
        `
                : ''
        }
        <button data-link-name="sign-in-eb : close" class="site-message--sign-in__dismiss ${
            bindableClassNames.closeBtn
        }">
            <span class="u-h">${tpl.closeButton}</span>
            ${close.markup}
        </button>
    </section>
</div>
`;
