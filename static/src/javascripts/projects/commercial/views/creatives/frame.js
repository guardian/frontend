// @flow

type Props = {
    data: {
        id: string,
        backgroundImage: string,
        clickMacro: string,
        destinationUrl: string,
        target: string,
        brandLogoPosition: string,
        brandUrl: string,
        target: string,
        brandLogo: string,
        contentColour: string,
        contentVerticalPosition: string,
        contentHorizontalPosition: string,
        clickMacro: string,
        destinationUrl: string,
        target: string,
        headerFontSize: string,
        header: string,
        textFontSize: string,
        text: string,
        clickMacro: string,
        callToActionUrl: string,
        target: string,
        callToAction: string,
        externalLinkIcon: string,
    },
};

export const template = ({ data }: Props) => `<aside id="${
    data.id
}" class="frame" data-link-name="creative | frame">
    <div class="frame__background">
        <img class="frame__background-image" src="${data.backgroundImage}">
    </div>
    <div class="frame__foreground">
        <a href="${data.clickMacro}${
    data.destinationUrl
}" class="frame__link-background" data-link-name="image" target="${
    data.target
}"></a>
        <a class="frame__logo frame__logo--${data.brandLogoPosition}" href="${
    data.brandUrl
}" data-link-name="logo" target="${data.target}">
            <img class="frame__logo__image" src="${data.brandLogo}">
        </a>
        <a style="color: ${
            data.contentColour
        }" class="frame__content frame__content--${
    data.contentVerticalPosition
} frame__content--${data.contentHorizontalPosition}" href="${data.clickMacro}${
    data.destinationUrl
}" target="${data.target}">
            <h2 style="font-size: ${
                data.headerFontSize
            }px" class="frame__content-title">${data.header}</h2>
            <p style="font-size: ${
                data.textFontSize
            }px" class="frame__content-text">${data.text}</p>
        </a>
        <a href="${data.clickMacro}${
    data.callToActionUrl
}" class="frame__cta frame__link button button--tertiary button--medium" data-link-name="call to action" target="${
    data.target
}">
            ${data.callToAction}${data.externalLinkIcon}
        </a>
    </div>
</aside>`;
