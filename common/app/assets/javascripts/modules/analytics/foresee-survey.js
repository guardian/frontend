define([], function() {

    function load() {
        
        var sample = (Math.random() * 500) < 1; // 0.2% or 1 in every 500
        if (sample || /forceForesee/.test(location.hash)) {
            require(['js!foresee'], function() {});
        }
    }
    
    return {
        load: load
    };

});
