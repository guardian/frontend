define(['common', 'modules/userPrefs', 'bonzo'], function (common, userPrefs, bonzo) {

    function Debug(options) {
        
        var opts = options || {},
            prefs = opts.userPrefs || userPrefs;

        this.show = function(){
            if (prefs.get('dev-debug') === 'true') {
                var debug = document.querySelector("#dev-debug");
                if (debug) {
                    bonzo(debug).addClass('active');
                }
                common.mediator.emit('modules:debug:render');
            }
        };
    }
    
    return Debug;
});
