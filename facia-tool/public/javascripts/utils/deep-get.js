/* global _: true */
define(function() {
    return function deepGet(obj, props) {
        props = _.isArray(props) ? props : (props || '').split(/\.+/).filter(function(str) {return str;});
        return obj && _.first(props) ? deepGet(obj[_.first(props)], _.rest(props)) : obj;
    };
});
