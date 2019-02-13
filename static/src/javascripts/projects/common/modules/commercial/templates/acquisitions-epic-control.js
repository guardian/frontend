// @flow
import { appendToLastElement } from 'lib/array-utils';

const buildFooter = (footer: string[]): string =>
    `<div class="contributions__epic-footer">
        ${footer
            .map(line => {
                const firstSpaceIndex = line.trim().indexOf(' ');
                const firstWord = line.substring(0, firstSpaceIndex);
                const remainder = line.substring(firstSpaceIndex);
                return `<h2><span class="contributions__epic-footer-blue">${firstWord}</span>${remainder}</h2>`;
            })
            .join('')}
    </div>`;

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
            
            ${footer ? buildFooter(footer) : ''}
        </div>
    </div>`;
