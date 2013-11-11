define(function () {

return window.atob ? function(str) { return window.atob(str); } : (function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        INVALID_CHARACTER_ERR = (function () {
            // fabricate a suitable error object
            try { document.createElement('$'); }
            catch (error) { return error; }
        }());

    return function (input) {
        input = input.replace(/[=]+$/, '');
        if (input.length % 4 === 1) throw INVALID_CHARACTER_ERR;
        for (
            // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
            // get next character
                buffer = input.charAt(idx++);
            // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    };
})();

}); // define
