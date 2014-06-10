define([
    'common/utils/config'
], function(
    config
    ) {

    function load() {
        if (config.switches.imrWorldwide) {
            var d = new Image(1, 1);
            d.src = [
                '//secure-uk.imrworldwide.com/cgi-bin/m?ci=uk-305078h&cg=0&cc=1&ts=compact',
                '&si=', encodeURI(window.location.href),
                '&rp=', encodeURI(document.referrer),
                '&rnd=', (new Date()).getTime()
            ].join('');
        }
    }

    return {
        load: load
    };

});
