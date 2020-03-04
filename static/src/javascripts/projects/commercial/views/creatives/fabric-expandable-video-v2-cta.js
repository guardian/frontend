// @flow

type Props = {
    position: string,
    media: string,
    link: string,
    image: string,
};

export const template = (props: Props) =>
    `<a class="creative__cta creative__cta--position-${props.position} ${
        props.media
    }" href="${props.link}" target="_blank"><img src="${props.image}" alt></a>`;
