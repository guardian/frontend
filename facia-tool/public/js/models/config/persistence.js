import _ from 'underscore';
import * as authedAjax from 'modules/authed-ajax';
import identity from 'utils/identity';
import EventEmitter from 'EventEmitter';

let postUpdateSym = Symbol();
class Persistence extends EventEmitter {
    constructor() {
        super();

        this[postUpdateSym] = (opts) => {
            this.emit('update:before');

            let callback = () => {
                this.emit('update:after');
            };

            return authedAjax.request(_.extend({
                type: 'POST'
            }, opts)).then(callback, callback);
        };

        this.collection = {
            save: (collection) => {
                if (!collection.id) {
                    if (isInitialCollection(collection)) {
                        return createFrontFromCollection(collection);
                    } else {
                        return createCollection(collection);
                    }
                } else {
                    return updateCollection(collection);
                }
            }
        };

        this.front = {
            update: (front) => {
                return postUpdate({
                    url: '/config/fronts/' + front.id(),
                    data: JSON.stringify(serializeFront(front))
                });
            }
        };
    }
}

let publicInterface = new Persistence();

/**
 * Copies properties and the current value of observables from a knockout model.
 */
function flattenModel (model) {
    return _.reduce(model, function (accumulator, value, key) {
        var x = _.isFunction(value) ? value() : value;

        if (x) {
            accumulator[key] = x;
        }

        return accumulator;
    }, {});
}

function serializeCollection (collection) {
    var model = flattenModel(collection.meta);

    if (collection.id) {
        model.id = collection.id;
    }

    return model;
}

function serializeFront (front) {
    var model = flattenModel(front.props);

    model.id = front.id();

    model.collections = _.chain(front.collections.items()).map(function (collection) {
        return collection.id;
    }).filter(identity).value();
    return model;
}

function isInitialCollection (collection) {
    var parents = collection.parents();

    if (parents.length === 1) {
        var siblings = parents[0].collections.items();

        return siblings.length === 1 && siblings[0] === collection;
    } else {
        return false;
    }
}

function postUpdate (opts) {
    return publicInterface[postUpdateSym](opts);
}

function createFrontFromCollection (collection) {
    var front = collection.parents()[0],
        serialized = serializeFront(front);

    /** We instead pass through the initial collection as a separate parameter */
    delete serialized.collections;

    return postUpdate({
        url: '/config/fronts',
        data: JSON.stringify(_.extend({
            initialCollection: serializeCollection(collection)
        }, serialized))
    });
}

function createCollection (collection) {
    return postUpdate({
        url: '/config/collections',
        data: JSON.stringify({
            frontIds: collection.frontIds(),
            collection: serializeCollection(collection)
        })
    });
}

function updateCollection (collection) {
    return postUpdate({
        url: '/config/collections/' + collection.id,
        data: JSON.stringify({
            frontIds: collection.frontIds(),
            collection: serializeCollection(collection)
        })
    });
}

export default publicInterface;
