// @flow
const integerCommas = (val: string | number): string | void => {
    // commafy integers. see formatters.spec.js for expected input/output
    const num = parseInt(val, 10);

    let digits;
    let i;
    let len;
    if (!isNaN(num)) {
        digits = num.toFixed(0).split('');
        len = digits.length;
        for (i = digits.length - 1; i >= 1; i -= 1) {
            if ((len - i) % 3 === 0) {
                digits.splice(i, 0, ',');
            }
        }
        return digits.join('');
    }
};

export { integerCommas };
