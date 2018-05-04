// @flow
import arrowRight from 'svgs/icon/arrow-right.svg';
import close from 'svgs/icon/close.svg';

type Feature = {
    icon: ?string,
    mainCopy: string,
    subCopy: string,
};

type LinkTargets = {
    signIn: string,
    register: string,
    why?: string,
};

type Template = {
    headerMain: string[],
    headerSub: string[],
    signInCta: string,
    registerCta: string,
    advantagesCta: string,
    closeButton: string,
    features: Feature[],
    links: LinkTargets,
};

const bindableClassNames = {
    closeBtn: 'site-message--sign-in__dismiss',
};

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

const makeTemplateHtml = (tpl: Template): string => `
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
        <button data-link-name="sign-in-eb : close" class="${
            bindableClassNames.closeBtn
        }">
            <span class="u-h">${tpl.closeButton}</span>
            ${close.markup}
        </button>
    </section>
</div>
`;

export type { Template, Feature, LinkTargets };
export { makeTemplateHtml, bindableClassNames };
