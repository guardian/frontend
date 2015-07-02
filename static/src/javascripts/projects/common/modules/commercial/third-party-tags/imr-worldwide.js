define([
    'common/utils/config'
], function (
    config
) {

    function load() {
        if (config.switches.imrWorldwide) {
            return function () {
                var img = new Image();
                img.src = [
                    '//secure-uk.imrworldwide.com/cgi-bin/m?ci=uk-305078h&cg=0&cc=1&ts=compact',
                    '&si=', encodeURI(window.location.href),
                    '&rp=', encodeURI(document.referrer),
                    '&rnd=', (new Date()).getTime()
                ].join('');
                console.log("IMR beacon just got called");
                return img;
            };
        }
    }

    return {
        load: load
    };

});
