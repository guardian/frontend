define(function () {
    return {
        integerCommas: function(val) {
            if (typeof(val) === 'string' || typeof(val) === 'number') {
                var strVal = typeof(val) === 'string' ? val : val.toFixed(0);
                return strVal.length < 4 ? strVal : strVal.substr(0, strVal.length - 3) + ',' + strVal.substr(-3);
            }

        }
    }
});


