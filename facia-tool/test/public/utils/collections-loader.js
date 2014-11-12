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
    var deferred = $.Deferred();

    document.body.innerHTML += templateCollections.replace(/\@[^\n]+\n/g, '');
    queryParams.set({
        front: 'uk'
    });
    new CollectionsEditor().init();
    // Number 2 is because we wait for two search, latest and the only
    // article in the collection.
    mediator.on('mock:search', _.after(2, _.once(function () {
        deferred.resolve();
    })));
    return deferred.promise();
});
