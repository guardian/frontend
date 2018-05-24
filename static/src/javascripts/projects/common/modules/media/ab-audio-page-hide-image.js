import fastdom from "fastdom";
import $ from "../../../../lib/$";
import {audioPageHideImage} from "common/modules/experiments/tests/audio-page-hide-image";
import {getVariant, isInVariant} from "common/modules/experiments/utils";

export const initAudioAbTest = (): void => {
    const variant = getVariant(audioPageHideImage, 'hide-image');
    const inTestVariant = variant &&  true //isInVariant(audioPageHideImage, variant);

    console.log("test js ran ----> ")


};
