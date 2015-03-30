define([
    'underscore',
    'models/collections/main',
    'test/fixtures/one-front-config',
    'mock/switches',
    'test/fixtures/articles',
    'test/fixtures/some-collections',
    'utils/layout-from-url',
    'views/collections.scala.html!text',
    'views/templates/vertical_layout.scala.html!text',
    'widgets/collection.html!text',
    'utils/mediator'
], function(
    _,
    CollectionsEditor,
    fixConfig,
    mockSwitches,
    fixArticles,
    fixCollections,
    layoutFromURL,
    templateCollections,
    verticalLayout,
    collectionView,
    mediator
){
    return function () {
        var deferred = $.Deferred();

        document.body.innerHTML += '<div id="_test_container_collections">' +
            verticalLayout +
            templateCollections.replace(/\@[^\n]+\n/g, '') +
            '</div>';

        layoutFromURL.get = function () {
            return [{
                type: 'latest'
            }, {
                type: 'front',
                config: 'uk'
            }];
        };

        // Mock the time
        var originalSetTimeout = window.setTimeout;
        jasmine.clock().install();
        fixArticles.reset();

        mediator.on('latest:loaded', function () {
            // wait for the debounce (give some time to knockout to handle bindings)
            originalSetTimeout(function () {
                jasmine.clock().tick(350);
            }, 50);
        });


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
            var container = document.getElementById('_test_container_collections');
            document.body.removeChild(container);
        }

        return {
            loader: deferred.promise(),
            unload: unload
        };
    };
});
