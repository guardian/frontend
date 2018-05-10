// @flow
import arrowRight from 'svgs/icon/arrow-right.svg';
import close from 'svgs/icon/close.svg';

import { bindableClassNames } from './template';

export const makeTemplateHtml = (tpl: Template): string => `
<div data-link-name="sign-in-eb : feedback-dismiss" class="site-message--sign-in__overlay ${
    bindableClassNames.closeBtn
}"></div>
<div id="site-message__message" class="site-message--sign-in-container">
    <section class="site-message__message site-message__message--sign-in">
        <div class="site-message--sign-in__header">
            <h2 class="site-message--sign-in__header-msg site-message--sign-in__header-msg--main">${
                tpl.headerMain
            }</h2>
            <p class="site-message--sign-in__header-msg site-message--sign-in__header-msg--sub">${
                tpl.headerSub
            }</p>
        </div>
        <fieldset class="site-message--sign-in__body">
            <legend class="u-h">${tpl.headerSub}</legend>
            ${tpl.reasonsWhy
                .map(
                    reason => `
                <label class="site-message--sign-in__radio">
                    <input type="radio" name="sign-in-eb-reason-why" data-link-name="sign-in-eb : feedback-response : ${
                        reason.key
                    }" 
                    value="${reason.key}" />
                    <span>${reason.label}</span>
                </label>
            `
                )
                .join('')}
        </fieldset>
        <div class="site-message--sign-in__buttons site-message--sign-in__buttons--compact">
            <button data-link-name="sign-in-eb : feedback-submit" class="site-message--sign-in-cta site-message--sign-in-cta--main ${
                bindableClassNames.closeBtn
            }">
                ${tpl.submitCta}
                ${arrowRight.markup}
            </a>
        </div>
        <button data-link-name="sign-in-eb : feedback-close" class="site-message--sign-in__dismiss ${
            bindableClassNames.closeBtn
        }">
            <span class="u-h">${tpl.closeButton}</span>
            ${close.markup}
        </button>
    </section>
</div>

`;
