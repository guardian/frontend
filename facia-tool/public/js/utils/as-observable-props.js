define([
    'underscore',
    'knockout'
], function(
    _,
    ko
) {
    return function(props) {
        return _.object(props.map(function(prop){
            return [prop, ko.observable()];
        }));
    };
});
