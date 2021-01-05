export const classNames = (props) =>
    Object.keys(props)
        .filter(f => props[f] === true)
        .join(' ');
