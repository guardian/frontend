// @flow

type Props = {
    videoURL: string,
    videoPositionV: string,
    videoPositionH: string,
    position: string,
};
export const template = ({
    videoURL,
    videoPositionV,
    videoPositionH,
    position,
}: Props) =>
    `<iframe width="409px" height="230px" src="${videoURL}?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="fluid250_video fluid250_video--desktop fluid250_video--vert-pos-${videoPositionV} fluid250_video--horiz-pos-${videoPositionH}" style="${position}"></iframe>`;
