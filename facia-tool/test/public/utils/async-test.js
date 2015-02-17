define([
    'underscore',
    'test/utils/collections-loader',
    'test/utils/config-loader',
    'knockout',
    'utils/mediator'
], function(
    _,
    collectionsLoader,
    configLoader,
    ko,
    mediator
){
    // Redefine the 'it' method so it waits for the loader
    var currentTesting, running;
    var loaders = {
        'collections': collectionsLoader,
        'config': configLoader
    };

    return function (what, description, test) {

        it(description, function (done) {
            // Prevent pressing on fronts, it messes up with other tests
            mediator.removeEvent('presser:detectfailures');

            if (currentTesting !== what) {
                if (running) {
                    ko.cleanNode(window.document.body);
                    running.unload();
                    _.once.reset();
                    mediator.removeAllListeners();
                }
                currentTesting = what;
                running = loaders[what]();
            }
            running.loader.then(function () {
                test(done);
            });
        });
    };
});
