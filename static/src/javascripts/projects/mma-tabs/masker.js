/*
 *   Usage:
 *   el.addEventListener('keyup', maskInput(' ', 4)) // cc
 *   el.addEventListener('keyup', maskInput(' / ', 2)) // date
 *   el.addEventListener('keyup', maskInput('', 4)) // cvc
 */
define(function () {
    function maskInput(delim, len) {

        var tokRegex = new RegExp('\\d{1,' + len + '}', 'g'),
            validRegex = new RegExp('\\d|(' + delim + ')|^', 'g'),
            delimRegex = new RegExp(delim, 'g'),
            prevValue = '';

        return function (event) {
            if (event.keyCode !== 8) {
                var toks = this.value.replace(delimRegex, '').match(tokRegex),
                    value = '';

                if (toks && this.selectionEnd === this.value.length) {
                    if (this.value.length >= prevValue.length
                        && toks[toks.length - 1].length === len) {
                        toks.push('');
                    }

                    value = toks.join(delim).slice(0, this.maxLength);
                } else {
                    value = this.value.match(validRegex).join('');
                }

                if (value !== this.value) {
                    this.value = value;
                }

                prevValue = this.value;
            }
        };
    }

    return maskInput;
});
