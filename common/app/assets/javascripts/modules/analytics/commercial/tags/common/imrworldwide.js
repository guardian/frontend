define([], function() {

    function load() {
        var d = new Image(1, 1);
        d.src = ["//secure-uk.imrworldwide.com/cgi-bin/m?ci=uk-305078h&cg=0&cc=1&si=", encodeURI(window.location.href), "&rp=", encodeURI(document.referrer), "&ts=compact&rnd=", (new Date()).getTime()].join('');
    }
    
    return {
        load: load
    };

});
