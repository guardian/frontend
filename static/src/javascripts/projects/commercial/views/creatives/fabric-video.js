// @flow

type Props = {
    data: {
        id: string,
        clickMacro: string,
        Link: string,
        Backgroundcolour: string,
        Backgroundimage: string,
        Backgroundposition: string,
        Backgroundrepeat: string,
        posterTablet: string,
        video: string,
        Layer1backgroundimage: string,
        Layer1backgroundimageposition: string,
        Layer2animatedimage1: string,
        Layer2animatedimage2: string,
        Layer2animatedimage3: string,
        Layer2animatedimage4: string,
        Layer2clickbutton: string,
        Layer2clickbutton: string,
        Layer3backgroundimage: string,
        Layer3backgroundimageposition: string,
        Backgroundcolour: string,
        BackgroundImagemobile: string,
        BackgroundImagemobileposition: string,
        Backgroundimagemobilerepeat: string,
        posterMobile: string,
        Layer1backgroundimagemobile: string,
        Layer1backgroundimagepositionmobile: string,
        Layer2backgroundimagemobile: string,
        Layer2backgroundimagepositionmobile: string,
        Layer3backgroundimagemobile: string,
        Layer3backgroundimagepositionmobile: string,
    },
};

export const template = ({ data }: Props) => `<div id="${
    data.id
}" class="creative creative--fabric-video">
    <a class="creative__link" href="${data.clickMacro}${
    data.Link
}" target="_blank">
        <div class="creative__alt creative__alt--tablet hide-until-tablet"  style="background-color:${
            data.Backgroundcolour
        };background-image:url(${data.Backgroundimage});background-position:${
    data.Backgroundposition
};background-repeat:${data.Backgroundrepeat};">
            ${data.posterTablet}
            ${data.video}
            <div class="creative__layer creative__layer1" style="background-image:url(${
                data.Layer1backgroundimage
            });background-position: ${
    data.Layer1backgroundimageposition
};"></div>
            <div class="creative__layer creative__layer2">
                <div style="background-image:url(${
                    data.Layer2animatedimage1
                })" class="creative__slide creative__slide1"></div>
                <div style="background-image:url(${
                    data.Layer2animatedimage2
                })" class="creative__slide creative__slide2"></div>
                <div style="background-image:url(${
                    data.Layer2animatedimage3
                })" class="creative__slide creative__slide3"></div>
                <div style="background-image:url(${
                    data.Layer2animatedimage4
                })" class="creative__slide creative__slide4">
                    ${
                        data.Layer2clickbutton
                            ? `<img src="${
                                  data.Layer2clickbutton
                              }" class="click_button"></div>`
                            : ''
                    }
                </div>
            </div>
            <div class="creative__layer creative__layer3" style="background-image:url(${
                data.Layer3backgroundimage
            });background-position: ${
    data.Layer3backgroundimageposition
};"></div>
        </div>

        <div class="creative__alt creative__alt--mobile mobile-only" style="background-color:${
            data.Backgroundcolour
        };background-image: url(${
    data.BackgroundImagemobile
});background-position:${
    data.BackgroundImagemobileposition
};background-repeat:${data.Backgroundimagemobilerepeat};">
            ${data.posterMobile}
            <div class="creative__layer creative__layer1" style="background-image:url(${
                data.Layer1backgroundimagemobile
            });background-position:${
    data.Layer1backgroundimagepositionmobile
};"></div>
            <div class="creative__layer creative__layer2" style="background-image:url(${
                data.Layer2backgroundimagemobile
            });background-position:${
    data.Layer2backgroundimagepositionmobile
};"></div>
            <div class="creative__layer creative__layer3" style="background-image:url(${
                data.Layer3backgroundimagemobile
            });background-position:${
    data.Layer3backgroundimagepositionmobile
};"></div>
        </div>
    </a>
</div>`;
