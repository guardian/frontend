define(['modules/userPrefs'], function (userPrefs) {

    function Debug() {
        if (window.localStorage && userPrefs.get('dev-debug') === 'true') {
            var debug = document.querySelector("#dev-debug");
            if (debug) {
                debug.style.display = 'block';
            }
            common.mediator.emit('modules:debug:render');
        }
    }
    
    return Debug;
});
