// @flow
import config from 'lib/config';

export const acquisitionsEpicBorderTemplate = ({
    copy: { heading = '', p1, p2 },
    componentName,
    buttonTemplate,
    testimonialBlock = '',
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
    testimonialBlock?: string,
}) => {
    const infoLogo = `<img class="contributions__info-logo" src="${config.get(
        'images.acquisitions.info-logo',
        ''
    )}" alt="Info">`;

    return `
        <div class="contributions__epic contributions__epic_border" data-component="${
            componentName
        }">
        <div>
            <div>
                <h2 class="contributions__title contributions__title--epic">
                    ${infoLogo}${heading}
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
    </div>
    `;
};
