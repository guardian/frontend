// @flow

type Props = {
    data: {
        id: string,
        backgroundColor: string,
        backgroundImageM: string,
        backgroundRepeatM: string,
        backgroundPositionM: string,
        showPlus: string,
        showArrow: string,
        slide1BGColor: string,
        slide1BGImageM: string,
        slide1BGImageRepeatM: string,
        slide1BGImagePositionM: string,
        clickMacro: string,
        link: string,
        slide1Layer1BGImageM: string,
        slide1Layer1BGImageRepeatM: string,
        slide1Layer1BGImagePositionM: string,
        slide1Layer2BGImageM: string,
        slide1Layer2BGImageRepeatM: string,
        slide1Layer2BGImagePositionM: string,
        slide1Layer3BGImageM: string,
        slide1Layer3BGImageRepeatM: string,
        slide1Layer3BGImagePositionM: string,
        slide2BGColor: string,
        slide2BGImageM: string,
        slide2BGImagePositionM: string,
        slide2BGImageRepeatM: string,
        videoMobile: string,
        clickMacro: string,
        link: string,
        slide2Layer1BGImageM: string,
        slide2Layer1BGImageRepeatM: string,
        slide2Layer1BGImagePositionM: string,
        slide2Layer2BGImageM: string,
        slide2Layer2BGImageRepeatM: string,
        slide2Layer2BGImagePositionM: string,
        slide2Layer3BGImageM: string,
        slide2Layer3BGImageRepeatM: string,
        slide2Layer3BGImagePositionM: string,
        backgroundColor: string,
        scrollbg: string,
        backgroundImage: string,
        backgroundRepeat: string,
        backgroundPosition: string,
        showPlus: string,
        showArrow: string,
        slide1BGColor: string,
        slide1BGImage: string,
        slide1BGImageRepeat: string,
        slide1BGImagePosition: string,
        clickMacro: string,
        link: string,
        slide1Layer1BGImage: string,
        slide1Layer1BGImageRepeat: string,
        slide1Layer1BGImagePosition: string,
        slide1Layer2BGImage: string,
        slide1Layer2BGImageRepeat: string,
        slide1Layer2BGImagePosition: string,
        slide1Layer3BGImage: string,
        slide1Layer3BGImageRepeat: string,
        slide1Layer3BGImagePosition: string,
        slide2BGColor: string,
        slide2BGImage: string,
        slide2BGImagePosition: string,
        slide2BGImageRepeat: string,
        videoDesktop: string,
        clickMacro: string,
        link: string,
        slide2Layer1BGImage: string,
        slide2Layer1BGImageRepeat: string,
        slide2Layer1BGImagePosition: string,
        slide2Layer2BGImage: string,
        slide2Layer2BGImageRepeat: string,
        slide2Layer2BGImagePosition: string,
        slide2Layer3BGImage: string,
        slide2Layer3BGImageRepeat: string,
        slide2Layer3BGImagePosition: string,
    },
};

// prettier-ignore
export const template = ({ data }:Props) => `<div id="${ data.id }" class="creative--expandable creative--fabric-expanding-v1">
    <div class="ad-slot__label adFullWidth__label facia-container--layout-front">
        <div class="facia-container__inner">Advertisement</div>
    </div>
    <div class="ad-exp--expand l-side-margins mobile-only" style="background-color: ${data.backgroundColor}">
        <div class="facia-container__inner facia-container__inner--full-span" style="background: url('${data.backgroundImageM}') ${data.backgroundRepeatM} ${data.backgroundPositionM};">
            ${data.showPlus}
            ${data.showArrow}
            <div class="ad-exp-collapse__slide slide-1" style="background: ${data.slide1BGColor} url('${data.slide1BGImageM}') ${data.slide1BGImageRepeatM} ${data.slide1BGImagePositionM};">
                <a href="${data.clickMacro}${data.link}" target="_new">
                    <div class="ad-exp__layer ad-exp__layer1" style="background: url('${data.slide1Layer1BGImageM}') ${data.slide1Layer1BGImageRepeatM} ${data.slide1Layer1BGImagePositionM};"></div>
                    <div class="ad-exp__layer ad-exp__layer2" style="background: url('${data.slide1Layer2BGImageM}') ${data.slide1Layer2BGImageRepeatM} ${data.slide1Layer2BGImagePositionM};"></div>
                    <div class="ad-exp__layer ad-exp__layer3" style="background: url('${data.slide1Layer3BGImageM}') ${data.slide1Layer3BGImageRepeatM} ${data.slide1Layer3BGImagePositionM};"></div>
                </a>
            </div>
            <div class="ad-exp-collapse__slide slide-2" style="background: ${data.slide2BGColor} url('${data.slide2BGImageM}') ${data.slide2BGImagePositionM} ${data.slide2BGImageRepeatM};">
                ${data.videoMobile}
                <a href="${data.clickMacro}${data.link}" target="_new">
                    <div class="ad-exp__layer ad-exp__layer1" style="background: url('${data.slide2Layer1BGImageM}') ${data.slide2Layer1BGImageRepeatM} ${data.slide2Layer1BGImagePositionM};"></div>
                    <div class="ad-exp__layer ad-exp__layer2" style="background: url('${data.slide2Layer2BGImageM}') ${data.slide2Layer2BGImageRepeatM} ${data.slide2Layer2BGImagePositionM};"></div>
                    <div class="ad-exp__layer ad-exp__layer3" style="background: url('${data.slide2Layer3BGImageM}') ${data.slide2Layer3BGImageRepeatM} ${data.slide2Layer3BGImagePositionM};"></div>
                </a>
            </div>
        </div>
    </div>
    <div class="ad-exp--expand l-side-margins hide-until-tablet" style="background-color: ${data.backgroundColor}">
        ${data.scrollbg}
        <div class="facia-container__inner facia-container__inner--full-span" style="background: url('${data.backgroundImage}') ${data.backgroundRepeat} ${data.backgroundPosition};">
            ${data.showPlus}
            ${data.showArrow}
            <div class="ad-exp-collapse__slide slide-1" style="background: ${data.slide1BGColor} url('${data.slide1BGImage}') ${data.slide1BGImageRepeat} ${data.slide1BGImagePosition};">
                <a href="${data.clickMacro}${data.link}" target="_new">
                    <div class="ad-exp__layer ad-exp__layer1" style="background: url('${data.slide1Layer1BGImage}') ${data.slide1Layer1BGImageRepeat} ${data.slide1Layer1BGImagePosition};"></div>
                    <div class="ad-exp__layer ad-exp__layer2" style="background: url('${data.slide1Layer2BGImage}') ${data.slide1Layer2BGImageRepeat} ${data.slide1Layer2BGImagePosition};"></div>
                    <div class="ad-exp__layer ad-exp__layer3" style="background : url('${data.slide1Layer3BGImage}') ${data.slide1Layer3BGImageRepeat} ${data.slide1Layer3BGImagePosition};"></div>
                </a>
            </div>
            <div class="ad-exp-collapse__slide slide-2" style="background: ${data.slide2BGColor} url('${data.slide2BGImage}') ${data.slide2BGImagePosition} ${data.slide2BGImageRepeat};">
                ${data.videoDesktop}
                <a href="${data.clickMacro}${data.link}" target="_new">
                    <div class="ad-exp__layer ad-exp__layer1" style="background: url('${data.slide2Layer1BGImage}') ${data.slide2Layer1BGImageRepeat} ${data.slide2Layer1BGImagePosition};"></div>
                    <div class="ad-exp__layer ad-exp__layer2" style="background: url('${data.slide2Layer2BGImage}') ${data.slide2Layer2BGImageRepeat} ${data.slide2Layer2BGImagePosition};"></div>
                    <div class="ad-exp__layer ad-exp__layer3" style="background: url('${data.slide2Layer3BGImage}') ${data.slide2Layer3BGImageRepeat} ${data.slide2Layer3BGImagePosition};"></div>
                </a>
            </div>
        </div>
    </div>
</div>`;
