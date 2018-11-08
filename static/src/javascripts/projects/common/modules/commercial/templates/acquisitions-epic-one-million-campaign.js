// @flow
import { appendToLastElement } from 'lib/array-utils';

export const acquisitionsEpicOneMillionCampaignTemplate = ({
    copy: { heading = '', paragraphs, highlightedText },
    componentName,
    buttonTemplate,
    epicClass = '',
    wrapperClass = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    epicClass?: string,
    wrapperClass?: string,
}) =>
    `<div class="contributions__epic ${epicClass}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
                <h2 class="contributions__one-million-large-heading">
                    ${heading}
                </h2>
                ${appendToLastElement(
                    paragraphs,
                    ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>`
                )
                    .map(
                        paragraph =>
                            `<p>${paragraph}</p>`
                    )
                    .join('')}
            </div>
    
            ${buttonTemplate}
            
            <div class="contributions__one-million-footer">
                <h2 class="contributions__one-million-large-heading"><span class="contributions-blue">Your</span> support counts.</h2>
                <h2 class="contributions__one-million-large-heading"><span class="contributions-blue">Together</span> we can be a force for change.</h2>
            </div>
        </div>
    </div>`;
