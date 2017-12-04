// @flow

export const acquisitionsEpicCirclesTemplate = ({
    copy: { heading = '', p1, p2 },
    componentName,
    buttonTemplate,
    testimonialBlock = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    testimonialBlock?: string,
}) =>
    `<div class="contributions__epic contributions__epic--circles" data-component="${
        componentName
    }">
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

        ${buttonTemplate}
    </div>`;
