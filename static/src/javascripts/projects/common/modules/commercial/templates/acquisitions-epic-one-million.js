// @flow
import { appendToLastElement } from 'lib/array-utils';


// TODO: take extra design element as an argument and display if passed in
// so that variant can be run with extra design element

export const acquisitionsEpicOneMillionTemplate = ({
                                                       copy: { heading = '', paragraphs, highlightedText },
                                                       componentName,
                                                       buttonTemplate,
                                                       epicClass = '',
                                                       wrapperClass = '',
                                                       designAddition = '',
                                                   }: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    epicClass?: string,
    wrapperClass?: string,
    designAddition?: string,
}) =>
    `<div class="contributions__epic ${epicClass}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
                <h2 class="contributions__title contributions__title--epic">
                    ${heading}
                </h2>
                ${appendToLastElement(
        paragraphs,
        ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>`
    )
        .map(
            paragraph =>
                `<p class="contributions__paragraph contributions__paragraph--epic">${paragraph}</p>`
        )
        .join('')}
            </div>
   
            ${buttonTemplate}
        </div>
    </div>`;
