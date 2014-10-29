define(function () {
    return {
        integerCommas: function (val) {
            var num = parseInt(val, 10);
            if (!isNaN(num)) {
                var digits = num.toFixed(0).split('');
                for (var i = digits.length - 1; i >= 3; i--) {
                    if (i % 3 === 0) {
                        digits.splice(digits.length - i, 0, ',');
                    }
                }
                return digits.join('');
            }
        }
    };
});
