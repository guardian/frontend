define([
    'underscore',
    'test/utils/collections-loader',
    'test/utils/config-loader',
    'knockout',
    'modules/list-manager',
    'utils/mediator'
], function(
    _,
    collectionsLoader,
    configLoader,
    ko,
    listManager,
    mediator
){
    var loaders = {
        'collections': collectionsLoader,
        'config': configLoader
    };

    return function sandbox (what) {
        var running;

        afterAll(function () {
            ko.cleanNode(window.document.body);
            running.unload();
            mediator.removeAllListeners();
            listManager.reset();
        });

        return function (description, test) {
            it(description, function (done) {
                // Prevent pressing on fronts, it messes up with other tests
                mediator.removeEvent('presser:detectfailures');

                if (!running) {
                    running = loaders[what]();
                }

                running.loader.then(function () {
                    test(done);
                });
            });
        };
    };
});
