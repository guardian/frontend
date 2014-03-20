define(function() {
    return function(obj, props) {
        props = (props + '').split(/\.+/).filter(function(str) {return str;});
        while (obj && props.length) {
          obj = obj[props.shift()];
        }
        return obj;
    };
});
