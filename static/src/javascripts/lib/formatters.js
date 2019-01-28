// @flow
const integerCommas = (
    val: string | number,
    truncate?: boolean
): string | void => {
    // commafy integers. see formatters.spec.js for expected input/output
    const num = parseInt(val, 10);
    if (Number.isNaN(num)) {
        return;
    }

    if (!!truncate && num > 9999) {
        const thousands = Math.floor(num / 1000);
        return `${thousands.toLocaleString()}k`;
    }

    return num.toLocaleString();
};

export { integerCommas };
