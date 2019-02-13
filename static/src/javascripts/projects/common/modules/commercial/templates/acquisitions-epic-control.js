// @flow
import { appendToLastElement } from 'lib/array-utils';

export const acquisitionsEpicControlTemplate = ({
    copy: { heading = '', paragraphs, highlightedText, footer },
    componentName,
    epicClassNames = [],
    buttonTemplate,
    wrapperClass = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    epicClassNames: string[],
    buttonTemplate?: string,
    wrapperClass?: string,
}) =>
    `<div class="contributions__epic ${epicClassNames.join(
        ' '
    )}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
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
            
            ${footer ?
                `<div class="contributions__epic-footer">
                    ${
                        footer.map(line => {
                            const firstSpaceIndex = line.trim().indexOf(' ');
                            return `<h2><span class="contributions__epic-footer-blue">${line.substring(0, firstSpaceIndex)}</span>${line.substring(firstSpaceIndex)}</h2>`;
                        }).join('')
                    }
                </div>`
            : ''}
        </div>
    </div>`;
