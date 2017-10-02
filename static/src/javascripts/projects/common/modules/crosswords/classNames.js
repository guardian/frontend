// @flow
const classNames = function(props: Object) {
    return Object.keys(props)
        .filter(function(f) {
            return props[f] === true;
        })
        .join(' ');
};

export { classNames } ;
