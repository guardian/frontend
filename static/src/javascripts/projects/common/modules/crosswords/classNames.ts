export const classNames = (props: Object) =>
    Object.keys(props)
        .filter((f) => props[f] === true)
        .join(' ');
