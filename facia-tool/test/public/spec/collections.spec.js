/* global curl: true */
define([
    'models/collections/main',
    'fixtures/one-front-config',
    'mock-switches',
    'mock-search',
    'mock-collection',
    'utils/query-params',
    'text!views/collections.scala.html',
    'utils/mediator'
], function(
    CollectionsEditor,
    fixConfig,
    mockSwitches,
    mockSearch,
    mockCollection,
    queryParams,
    templateCollections,
    mediator
){
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    var testArticle = {
        apiUrl: '/capi',
        id: 'politics/uk/2014/nov/07/i-won-the-elections',
        webPublicationDate: '2014-11-07T14:45:00Z',
        webTitle: 'I won the elections',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'I won the elections',
            thumbnail: '/thumbnail',
            internalContentCode: "1234567890"
        }
    };
    var collections = {
        latest: {
            lastUpdated: yesterday.toISOString(),
            live: [{
                id: 'politics/uk/2014/nov/07/i-won-the-elections',
                frontPublicationDate: 1415193273347
            }],
            updatedBy: 'Test'
        }
    };

    mockSearch.latest([testArticle]);
    mockSearch.set({
        'politics/uk/2014/nov/07/i-won-the-elections': {
            response: {
                results: [testArticle]
            }
        }
    });
    mockCollection.set(collections);

    document.body.innerHTML += templateCollections;
    queryParams.set({
        front: 'uk'
    });

    describe('Collections', function () {
        it('displays the correct timing', function (done) {
            new CollectionsEditor().init();
            mediator.on('mock:search', _.after(2, function () {
                expect(
                    $('.list-header__timings').text().replace(/\s+/g, ' ')
                ).toMatch('1 day ago by Test');
                done();
            }));
        });
    });
});
