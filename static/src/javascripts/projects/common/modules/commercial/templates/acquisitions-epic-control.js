// @flow
const appendHighlightedText = (
    paragraphs: Array<string>,
    highlightedText?: string
): Array<string> =>
    paragraphs.map((paragraph, index) => {
        if (highlightedText && index + 1 === paragraphs.length) {
            return `${paragraph} <strong><span class="contributions__highlight">${highlightedText}</span></strong>`;
        }

        return paragraph;
    });

export const acquisitionsEpicControlTemplate = ({
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
                <h2 class="contributions__title contributions__title--epic">
                    ${heading}
                </h2>
                ${appendHighlightedText(paragraphs, highlightedText)
                    .map(
                        paragraph =>
                            `<p class="contributions__paragraph contributions__paragraph--epic">${paragraph}</p>`
                    )
                    .join('')}
            </div>
    
            ${buttonTemplate}
        </div>
    </div>`;
