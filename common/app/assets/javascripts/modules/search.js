define([], function () {

    function Search(config) {

        var gcsUrl = 'http://www.google.co.uk/cse/cse.js?cx=007466294097402385199:m2ealvuxh1i';

        this.init = function() {
            if (config.switches.googleSearch) {
                require(['js!' + gcsUrl], function () {});
            }
        };
    }

    return Search;
});
