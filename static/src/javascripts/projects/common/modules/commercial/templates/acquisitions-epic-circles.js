// @flow

export const acquisitionsEpicCirclesTemplate = ({
    copy: { heading = '', p1, p2 },
    componentName,
    buttonTemplate,
    testimonialBlock = '',
    epicClass = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    testimonialBlock?: string,
    epicClass?: string,
}) =>
    `<div class="contributions__epic ${epicClass}" data-component="${
        componentName
    }">
        <h2 class="contributions__title contributions__title--epic">
            ${heading}
        </h2>
        <p class="contributions__paragraph contributions__paragraph--epic">
            ${p1}
        </p>
        <h3 class="contributions__epic-heading">we haven't put up a paywall</h3>
        ${testimonialBlock}
        <p class="contributions__paragraph contributions__paragraph--epic">
            ${p2}
        </p>

        ${buttonTemplate}
    </div>`;
