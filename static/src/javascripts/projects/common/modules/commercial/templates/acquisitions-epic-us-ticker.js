// @flow
import { acquisitionsEpicTickerTemplate } from 'common/modules/commercial/templates/acquisitions-epic-ticker';
import { appendToLastElement } from 'lib/array-utils';

export type TickerPosition = 'TOP' | 'BOTTOM';

export const acquisitionsEpicUsTickerTemplate = ({
    copy: { heading = '', paragraphs, highlightedText },
    componentName,
    buttonTemplate,
    tickerPosition,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    tickerPosition: TickerPosition,
}) =>
    `<div class="contributions__epic contributions__epic--with-ticker" data-component="${componentName}" data-link-name="epic">
        <div>
            <div>
                ${
                    tickerPosition === 'TOP'
                        ? acquisitionsEpicTickerTemplate
                        : ''
                }

                <h2 class="contributions__title contributions__title--big">
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

            ${buttonTemplate}

            ${tickerPosition === 'BOTTOM' ? acquisitionsEpicTickerTemplate : ''}
        </div>
    </div>`;
