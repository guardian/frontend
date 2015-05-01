import collectionsLoader from 'test/utils/collections-loader';
import configLoader from 'test/utils/config-loader';
import ko from 'knockout';
import listManager from 'modules/list-manager';
import mediator from 'utils/mediator';

var loaders = {
    'collections': collectionsLoader,
    'config': configLoader
};

var yeld = setTimeout;

export default function sandbox(what) {
    var running, testMethod;

    afterAll(function () {
        ko.cleanNode(window.document.body);
        running.unload();
        mediator.removeAllListeners();
        listManager.reset();
    });

    testMethod = function (description, test) {
        it(description, function (done) {
            // Prevent pressing on fronts, it messes up with other tests
            mediator.removeEvent('presser:detectfailures');

            if (!running) {
                running = loaders[what]();
            }

            running.loader.then(() => {
                yeld(() => {
                    test.call(this, done);
                }, 10);
            });
        });
    };

    testMethod.context = function () {
        return running;
    };

    return testMethod;
}
