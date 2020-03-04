// @flow
type Props = {
    backgroundImageP: string,
    backgroundImagePRepeat: string,
};

export const template = ({ backgroundImageP, backgroundImagePRepeat }: Props) =>
    `<div class="ad-scrolling-bg" style="background-image: url('${backgroundImageP}'); background-position: 50% 0; background-repeat: ${backgroundImagePRepeat}"></div>`;
