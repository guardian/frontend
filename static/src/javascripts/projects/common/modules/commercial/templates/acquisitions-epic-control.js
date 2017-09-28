// @flow
export const acquisitionsEpicControlTemplate = ({
    copy,
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
    `<div class="contributions__epic ${epicClass}" data-component="${componentName}">
        <div class="${wrapperClass}">
            <div>
                <h2 class="contributions__title contributions__title--epic">
                    ${copy.heading ? copy.heading : ''}
                </h2>
                <p class="contributions__paragraph contributions__paragraph--epic">
                    ${copy.p1}
                </p>
                ${testimonialBlock}
                <p class="contributions__paragraph contributions__paragraph--epic">
                    ${copy.p2}
                </p>
            </div>
    
            ${buttonTemplate}
        </div>
    </div>`;
