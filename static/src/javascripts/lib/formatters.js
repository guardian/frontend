export default {
    integerCommas: function(val) {
        // commafy integers. see formatters.spec.js for expected input/output
        var num = parseInt(val, 10),
            digits, i, len;
        if (!isNaN(num)) {
            digits = num.toFixed(0).split('');
            len = digits.length;
            for (i = digits.length - 1; i >= 1; i--) {
                if ((len - i) % 3 === 0) {
                    digits.splice(i, 0, ',');
                }
            }
            return digits.join('');
        }
    }
};
