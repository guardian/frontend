define([
    'underscore',
    'modules/vars',
    'test-config',
    'test/utils/collections-loader',
    'test/utils/config-loader',
    'test/utils/mockjax',
    'mock/config',
    'mock/switches',
    'knockout',
    'modules/list-manager',
    'utils/mediator'
], function(
    _,
    vars,
    testConfig,
    collectionsLoader,
    configLoader,
    mockjax,
    mockConfig,
    mockSwitches,
    ko,
    listManager,
    mediator
){
    var loaders = {
        'collections': collectionsLoader,
        'config': configLoader
    };

    return function sandbox (what) {
        var running,
            mockjaxScope = mockjax();

        afterAll(function () {
            ko.cleanNode(window.document.body);
            running.unload();
            mediator.removeAllListeners();
            listManager.reset();
            mockConfig.clear();
            mockSwitches.clear();
        });
        beforeEach(function () {
            mockjaxScope({
                url: '/frontend/config',
                responseText: testConfig.defaults
            });
        });
        afterEach(function () {
            mockjaxScope.clear();
        });

        return function (description, test) {
            it(description, function (done) {
                // Prevent pressing on fronts, it messes up with other tests
                mediator.removeEvent('presser:detectfailures');

                if (!running) {
                    vars.priority = 'test';
                    mockConfig.set(testConfig.config);
                    mockSwitches.set(testConfig.switches);
                    running = loaders[what]();
                }

                running.loader.then(function () {
                    test(done);
                });
            });
        };
    };
});
