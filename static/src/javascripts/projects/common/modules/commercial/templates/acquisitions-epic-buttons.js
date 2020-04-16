// @flow
import { paymentMethodLogosTemplate } from 'common/modules/commercial/templates/payment-method-logos-template';
import type { ReminderFields } from 'common/modules/commercial/templates/acquisitions-epic-reminder';
import config from "../../../../../lib/config";

export const epicButtonsTemplate = (
    primaryCta: EpicCta,
    secondaryCta?: EpicCta,
    reminderFields?: ReminderFields
) => {
    const supportButtonSupport = `
        <div>
            <a class="component-button component-button--primary component-button--hasicon-right contributions__contribute--epic-member"
              href="${primaryCta.url}"
              target="_blank">
                ${primaryCta.ctaText}
                <svg
                class="svg-arrow-right-straight"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 17.89"
                preserveAspectRatio="xMinYMid"
                aria-hidden="true"
                focusable="false"
                >
                    <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                </svg>
            </a>
        </div>`;

    const secondaryButton = secondaryCta
        ? `
            <a class="component-button component-button--greyHollow component-button--greyHollow--for-epic component-button--hasicon-right contributions__contribute--epic-member contributions__secondary-button contributions__secondary-button--epic"
              href=${secondaryCta.url}
              target="_blank">
              ${secondaryCta.ctaText}
              <svg
                class="svg-arrow-right-straight"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 17.89"
                preserveAspectRatio="xMinYMid"
                aria-hidden="true"
                focusable="false"
                >
                    <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                </svg>
                </a>`
        : '';

    const showReminder = config.get('switches.showContributionReminder');
    const reminderCta = reminderFields ? reminderFields.reminderCTA : "Remind me in July";

    const reminderButton = showReminder
        ? `<label for="epic-reminder__reveal-reminder" class="epic-reminder__prompt-label">
            <div data-cta-copy="${
                reminderCta
            }" tabindex="0" class="component-button component-button--greyHollow component-button--greyHollow--for-epic component-button--reminder-prompt contributions__secondary-button contributions__secondary-button--epic" role="checkbox">
                    ${reminderCta}
            </div>
        </label>`
        : '';

    const reminderInput = showReminder
        ? `<input type="checkbox" id="epic-reminder__reveal-reminder" class="epic-reminder__reveal-reminder" />`
        : '';

    return `
        ${reminderInput}
        <div class="contributions__buttons">
            ${supportButtonSupport}
            ${secondaryButton}
            ${reminderButton}
            ${paymentMethodLogosTemplate(
                'contributions__payment-logos contributions__contribute--epic-member'
            )}
        </div>`;
};
