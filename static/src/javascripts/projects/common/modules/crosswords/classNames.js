// @flow
const classNames = function(props: Object) {
    return Object.keys(props)
        .filter(f => props[f] === true)
        .join(' ');
};

export { classNames };
