// @flow
export const acquisitionsEpicControlTemplate = ({
    copy: { heading = '', p1, p2 },
    componentName,
    buttonTemplate,
    testimonialBlock = '',
    epicClass = '',
    wrapperClass = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    testimonialBlock?: string,
    epicClass?: string,
    wrapperClass?: string,
}) =>
    `<div class="contributions__epic ${epicClass}" data-component="${componentName}" data-link-name="epic">
        <div class="${wrapperClass}">
            <div>
                <h2 class="contributions__title contributions__title--epic">
                    ${heading}
                </h2>
                <p class="contributions__paragraph contributions__paragraph--epic">
                    ${p1}
                </p>
                ${testimonialBlock}
                <p class="contributions__paragraph contributions__paragraph--epic">
                    ${p2}
                </p>
            </div>
    
            ${buttonTemplate}
        </div>
    </div>`;
