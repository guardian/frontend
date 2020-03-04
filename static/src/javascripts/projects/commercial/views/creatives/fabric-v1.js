// @flow
type Props = {
    data: {
        id: string,
        hasContainer: string,
        showLabel: string,
        backgroundColor: string,
        backgroundImage: string,
        backgroundPosition: string,
        backgroundRepeat: string,
        scrollbg: string,
        clickMacro: string,
        link: string,
        video: string,
        layerOneBGImage: string,
        layerOneBGPosition: string,
        layerTwoBGImage: string,
        layerTwoBGPosition: string,
        layerThreeBGImage: string,
        layerThreeBGPosition: string,
        backgroundImageM: string,
        backgroundPositionM: string,
        backgroundRepeatM: string,
        scrollbg: string,
        layerOneBGImageM: string,
        layerOneBGPositionM: string,
        layerTwoBGImageM: string,
        layerTwoBGPositionM: string,
        layerThreeBGImageM: string,
        layerThreeBGPositionM: string,
    },
};

export const template = ({ data }: Props) => `${
    data.hasContainer ? '<div class="creative--fabric-v1-bg-container">' : ''
}
${
    data.showLabel
        ? `
    <div class="ad-slot__label creative--fabric-v1__label fc-container--layout-front">
        <div class="fc-container__inner">Advertisement</div>
    </div>`
        : ''
}

<div id="${
    data.id
}" class="creative--fabric-v1 l-side-margins hide-until-tablet" style="
    background-color: ${data.backgroundColor};
    background-image: url(${data.backgroundImage});
    background-position: ${data.backgroundPosition};
    background-repeat: ${data.backgroundRepeat};
">
    <%if (data.scrollbg) {}${data.scrollbg}<%}}
    <a href="${data.clickMacro}${data.link}" target="_blank">
        <div class="gs-container">
            ${data.video}
            <div class="fabric-v1_layer fabric-v1_layer1" style="
            background-image: url(${data.layerOneBGImage});
            background-position: ${data.layerOneBGPosition};
        "></div>
            <div class="fabric-v1_layer fabric-v1_layer2" style="
            background-image: url(${data.layerTwoBGImage});
            background-position: ${data.layerTwoBGPosition};
        "></div>
            <div class="fabric-v1_layer fabric-v1_layer3" style="
            background-image: url(${data.layerThreeBGImage});
            background-position: ${data.layerThreeBGPosition};
        "></div>
        </div>
    </a>
</div>
<div class="creative--fabric-v1 l-side-margins mobile-only" style="
    background-color: ${data.backgroundColor};
    background-image: url(${data.backgroundImageM});
    background-position: ${data.backgroundPositionM};
    background-repeat: ${data.backgroundRepeatM};
">
    <%if (data.scrollbg) {}${data.scrollbg}<%}}
    <a href="${data.link}" target="_blank">
        <div class="gs-container">
            <div class="fabric-v1_layer fabric-v1_layer1" style="
            background-image: url(${data.layerOneBGImageM});
            background-position: ${data.layerOneBGPositionM};
        "></div>
            <div class="fabric-v1_layer fabric-v1_layer1" style="
            background-image: url(${data.layerTwoBGImageM});
            background-position: ${data.layerTwoBGPositionM};
        "></div>
            <div class="fabric-v1_layer fabric-v1_layer1" style="
            background-image: url(${data.layerThreeBGImageM});
            background-position: ${data.layerThreeBGPositionM};
        "></div>
        </div>
    </a>
</div>
${data.hasContainer ? '</div>' : ''}`;
