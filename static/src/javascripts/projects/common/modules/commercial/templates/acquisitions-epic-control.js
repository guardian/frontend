// @flow
import { appendToLastElement } from 'lib/array-utils';
import { acquisitionsEpicTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-ticker';
import { acquisitionsEpicReminderTemplate } from 'common/modules/commercial/templates/acquisitions-epic-reminder';
import type { ReminderFields } from 'common/modules/commercial/templates/acquisitions-epic-reminder';
import { canShowContributionsReminderFeature } from 'common/modules/commercial/user-features';

const buildFooter = (footer: string[]): string =>
    `<div class="contributions__epic-footer">
        ${footer.map(line => `<h2>${line}</h2>`).join('')}
    </div>`;

const buildImage = (url: string): string =>
    `<div class="contributions__epic-image">
        <img src="${url}" alt="Image for Guardian contributions message"/>
    </div>`;

export const defaultReminderFields: ReminderFields = {
    reminderCTA: 'Remind me in September',
    reminderDate: '2020-09-15 00:00:00',
    reminderDateAsString: 'September 2020',
};

export const acquisitionsEpicControlTemplate = ({
    copy: { heading = '', paragraphs, highlightedText, footer },
    componentName,
    epicClassNames = [],
    buttonTemplate,
    wrapperClass = '',
    showTicker = false,
    backgroundImageUrl,
    showReminderFields,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    epicClassNames: string[],
    buttonTemplate?: string,
    wrapperClass?: string,
    showTicker: boolean,
    showReminderFields?: ReminderFields | null,
    backgroundImageUrl?: string,
}) => {
    const extraClasses = (backgroundImageUrl
        ? epicClassNames.concat(['contributions__epic--with-image'])
        : epicClassNames
    ).join(' ');


    const reminderFields = showReminderFields || defaultReminderFields;

    return `<div class="contributions__epic ${extraClasses}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
                ${showTicker ? acquisitionsEpicTickerTemplate : ''}

                ${backgroundImageUrl ? buildImage(backgroundImageUrl) : ''}



                <h2 class="contributions__title">
                    ${heading}
                </h2>
                ${appendToLastElement(
                    paragraphs,
                    highlightedText
                        ? ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>`
                        : ''
                )
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')}
            </div>

            ${buttonTemplate || ''}

            ${footer ? buildFooter(footer) : ''}

            ${canShowContributionsReminderFeature() ? acquisitionsEpicReminderTemplate(reminderFields) : ''}
        </div>
    </div>`;
};
