// @flow

type Props = {
    width: number,
    height: number,
    src: string,
    className: string,
    inlineStyle: string,
};

export const template = ({
    width,
    height,
    src,
    className,
    inlineStyle,
}: Props) => `<iframe
    width="${width}"
    height="${height}"
    src="${src}"
    frameborder="0"
    class="${className}"
    style="${inlineStyle}">
</iframe>`;
