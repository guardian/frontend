/* global _: true */
define(['knockout'], function(ko) {
    return function(props) {
        return _.object(props.map(function(prop){
            return [prop, ko.observable()];
        }));
    };
});
