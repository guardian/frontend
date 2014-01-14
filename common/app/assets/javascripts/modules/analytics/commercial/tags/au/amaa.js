define([], function() {

    var ammaUrl = "js!//c.supert.ag/the-guardian/the-guardian/supertag-async.js";

    function load() {
        require([ammaUrl], function() {});
    }
    
    return {
        load: load
    };

});
