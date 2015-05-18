import $ from 'jquery';
import ko from 'knockout';
import mediator from 'utils/mediator';

function createMockFront (frontId, description) {
    var deferreds = {},
        allCollections = {},
        front = {
            front: ko.observable(frontId),
            collections: ko.observableArray(),
            sparklinesOptions: ko.observable({}),
            _collections: {}
        }
    ;

    if (description) {
        var collectionsInFront = applyDescription(front, deferreds, description);
        collectionsInFront.forEach(function (collection) {
            allCollections[collection._key] = collection;
        });
        front.collections(collectionsInFront);
    }

    front._resolveCollection = function (id) {
        var collection = allCollections[id];
        collection.eachArticle(function (article) {
            article.props.webUrl(article._description.article);
        });
        deferreds[id].deferred.resolve();
        mediator.emit('collection:populate', deferreds[id].collection);
    };

    front._load = function (frontId, description) {
        front.front(frontId);
        var collectionsInFront = applyDescription(front, deferreds, description);
        collectionsInFront.forEach(function (collection) {
            allCollections[collection._key] = collection;
        });
        front.collections(collectionsInFront);
    };

    front._addArticle = function (id, article) {
        var collection = allCollections[id];
        appendArticles(collection._items, [article], front, true);
        deferreds[id].deferred = new $.Deferred();
        mediator.emit('collection:populate', collection);
    };

    return front;
}

function applyDescription (front, deferreds, description) {
    var collections = [];

    Object.keys(description).forEach(function (key) {
        var collection = { front: front },
            deferred = new $.Deferred(),
            articles = [];

        collection.loaded = deferred.promise();
        collection.eachArticle = function (callback) {
            this._items().forEach(callback);
        };
        collection.contains = function (article) {
            var found = false;
            this.eachArticle(function (item) {
                found = found || (item._id === article._id);
            });
            return found;
        };
        collection._items = ko.observableArray(articles);
        collection._key = key;

        deferreds[key] = {
            deferred: deferred,
            collection: collection
        };
        collections.push(collection);

        appendArticles(articles, description[key], front);
    });

    return collections;
}

function appendArticles (all, list, front, webUrlReady) {
    list.forEach(function (articleDescription) {
        var article = {
            props: {
                webUrl: ko.observable(webUrlReady ? articleDescription.article : null)
            },
            front: front,
            _name: articleDescription.article ? ('article: ' + articleDescription.article) : ('snap: ' + articleDescription.snap),
            _id: (articleDescription.article || articleDescription.snap).replace(/\//g, '_'),
            _description: articleDescription
        };

        all.push(article);
    });
}

export default createMockFront;
