define([], function() {

    var quantcastUrl = "js!http://edge.quantserve.com/quant.js";

    function load() {
        require([quantcastUrl], function() {
            window._qevents.push({
                qacct:"p-73ktnlRTKQPTw"
            });
        });
    }
    
    return {
        load: load
    };

});
