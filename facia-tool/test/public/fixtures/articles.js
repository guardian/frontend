define([
    'mock/search',
    'test/fixtures/dates'
], function (
    mockSearch,
    dates
) {
    var allArticles = [{
        id: 'article/one',
        webPublicationDate: dates.justNow.toISOString(),
        webTitle: 'I won the elections',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'I won the elections',
            thumbnail: 'http://static.guim.co.uk/sys-images/Guardian/Pix/audio/video/2012/4/30/1335773468470/Barack-Obama-laughs-at-co-011.jpg',
            internalContentCode: '1'
        }
    }, {
        id: 'article/two',
        webPublicationDate: dates.yesterday.toISOString(),
        webTitle: 'It\'s raining right now',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'It\'s raining right now',
            thumbnail: 'http://i.guim.co.uk/static/w-620/h--/q-95/sys-images/Guardian/Pix/pictures/2014/8/15/1408088221012/Biblical-storm-clouds-ove-012.jpg',
            internalContentCode: '2'
        }
    }, {
        id: 'article/three',
        webPublicationDate: dates.minutesAgo.toISOString(),
        webTitle: 'Went for a coffee',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'Went for a coffee',
            thumbnail: 'http://media.gizmodo.co.uk/wp-content/uploads/2013/05/Guardian-Coffee.jpg',
            internalContentCode: '3'
        }
    }, {
        id: 'article/four',
        webPublicationDate: dates.lastWeek.toISOString(),
        webTitle: 'Santa Claus is a real thing',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'Santa Claus is a real thing',
            thumbnail: 'http://i.guim.co.uk/static/w-700/h--/q-95/sys-images/Guardian/Pix/pictures/2012/12/23/1356296021064/Santa-Claus-029.jpg',
            internalContentCode: '4'
        }
    }, {
        id: 'article/five',
        webPublicationDate: dates.lastMonth.toISOString(),
        webTitle: 'Nothing happened for once',
        webUrl: 'http://theguardian.com/uk',
        fields: {
            headline: 'Nothing happened for once',
            thumbnail: 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2012/6/13/1339581847676/Half-empty-glass-008.jpg',
            internalContentCode: '5'
        }
    }];

    function reset() {
        mockSearch.latest(allArticles);
        var mockData = {};
        for (var i = 0; i < allArticles.length; i += 1) {
            mockData['internal-code/content/' + allArticles[i].fields.internalContentCode] = {
                response: {
                    results: [allArticles[i]],
                    status: 'ok'
                }
            };
        }
        mockSearch.set(mockData);
    }

    reset();
    return {
        reset: reset
    };
});
