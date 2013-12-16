define(['knockout', 'lodash/arrays/zipObject'], function(ko, zipObject) {
    return function(props) {
        return zipObject(props.map(function(prop){
            return [prop, ko.observable()];
        }));
    };
});
