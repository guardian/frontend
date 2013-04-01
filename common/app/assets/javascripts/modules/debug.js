define(['common', 'modules/userPrefs'], function (common, userPrefs) {

    function Debug() {

        this.show = function(){
            if (window.localStorage && userPrefs.get('dev-debug') === 'true') {
                var debug = document.querySelector("#dev-debug");
                if (debug) {
                    debug.style.display = 'block';
                }
                common.mediator.emit('modules:debug:render');
            }
        };
    }
    
    return Debug;
});
