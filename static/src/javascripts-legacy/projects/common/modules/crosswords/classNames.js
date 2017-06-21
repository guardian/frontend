define(function() {
    return function(props) {
        return Object.keys(props)
            .filter(function(f) {
                return props[f] === true;
            })
            .join(' ');
    };
});
