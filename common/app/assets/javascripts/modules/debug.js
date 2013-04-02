define(['common', 'modules/userPrefs', 'bonzo'], function (common, userPrefs, bonzo) {

    function Debug() {

        this.show = function(){
            if (userPrefs.get('dev-debug') === 'true') {
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
