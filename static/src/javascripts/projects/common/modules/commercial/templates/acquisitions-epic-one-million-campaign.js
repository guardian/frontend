// @flow
import { appendToLastElement } from 'lib/array-utils';

export const acquisitionsEpicOneMillionCampaignTemplate = ({
    copy: { heading = '', paragraphs, highlightedText },
    componentName,
    buttonTemplate,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
}) =>
    `<div class="contributions__epic contributions__epic--one-million" data-component="${componentName}" data-link-name="epic">
        <div>
            <div>
                <h2 class="contributions__title contributions__title--one-million">
                    ${heading}
                </h2>
                ${appendToLastElement(
                    paragraphs,
                    ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>`
                )
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')}
            </div>
    
            ${buttonTemplate}
            
            <div class="contributions__one-million-footer">
                <h2><span class="contributions-blue">Your</span> support counts.</h2>
                <h2><span class="contributions-blue">Together</span> we can be a force for change.</h2>
            </div>
        </div>
    </div>`;
