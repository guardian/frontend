define([
    'models/collections/main',
    'test/fixtures/one-front-config',
    'mock-switches',
    'test/fixtures/articles',
    'test/fixtures/some-collections',
    'utils/query-params',
    'text!views/collections.scala.html',
    'utils/mediator'
], function(
    CollectionsEditor,
    fixConfig,
    mockSwitches,
    fixArticles,
    fixCollections,
    queryParams,
    templateCollections,
    mediator
){
    return function () {
        var deferred = $.Deferred();

        document.body.innerHTML += templateCollections.replace(/\@[^\n]+\n/g, '');
        queryParams.set({
            front: 'uk'
        });

        // Mock the time
        jasmine.clock().install();
        fixArticles.reset();
        new CollectionsEditor().init();

        // Number 2 is because we wait for two search, latest and the only
        // article in the collection.
        mediator.on('mock:search', _.after(2, _.once(function () {
            deferred.resolve();
        })));

        // The first tick is for the configuration to be loaded
        jasmine.clock().tick(100);
        // The second tick is for the collections to be leaded
        jasmine.clock().tick(300);

        function unload () {
            jasmine.clock().uninstall();
            var container = document.querySelector('.alert').parentNode;
            document.body.removeChild(container);
        }

        return {
            loader: deferred.promise(),
            unload: unload
        };
    };
});
