define(function () {

    // thank you http://www.electrictoolbox.com/pad-number-zeroes-javascript/
    return function (number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    };

});
