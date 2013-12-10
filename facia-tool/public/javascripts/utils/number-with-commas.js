define(function() {
    return function(x) {
        var pattern = /(-?\d+)(\d{3})/;

        if(typeof x === 'undefined') { return ''; }

        x = x.toString();
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    };
});
