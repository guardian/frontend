// @flow
import { appendToLastElement } from 'lib/array-utils';

export const acquisitionsEpicControlTemplate = ({
    copy: { heading = '', paragraphs, highlightedText },
    componentName,
    buttonTemplate,
    epicClass = '',
    wrapperClass = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate?: string,
    epicClass?: string,
    wrapperClass?: string,
}) =>
    `<div class="contributions__epic ${epicClass}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
                <h2 class="contributions__title">
                    ${heading}
                </h2>
                ${appendToLastElement(
                    paragraphs,
                    highlightedText ? ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>` : ''
                )
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')}
            </div>
    
            ${buttonTemplate ? buttonTemplate : ""}
        </div>
    </div>`;
