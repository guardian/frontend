define(function() {
    return function(str){
        return ('' + str).split(/\s+/).filter(function(s) { return s; }).join(' ');
    };
});
