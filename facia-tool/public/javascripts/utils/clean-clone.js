define(function() {
    return function(obj){
        return JSON.parse(JSON.stringify(obj));
    };
});
