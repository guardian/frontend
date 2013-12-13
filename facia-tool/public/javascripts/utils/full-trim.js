define(function() {
    return function(str){
        return str ? str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ') : undefined;
    };
});
