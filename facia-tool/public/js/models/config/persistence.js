define([
    'underscore',
    'modules/authed-ajax',
    'modules/vars',
    'utils/identity'
], function (
    _,
    authedAjax,
    vars,
    identity
) {
    var onUpdateCallbacks = [];

    var postUpdate = function (opts) {
        vars.model.pending(true);

        authedAjax.request(_.extend({
            type: 'POST'
        }, opts)).always(function () {
            _.each(onUpdateCallbacks, function (callback) {
                callback();
            });
        });
    };

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

    return {
        collection: {
            create: function (collection) {
                postUpdate({
                    url: '/config/collections',
                    data: JSON.stringify({
                        frontIds: collection.frontIds(),
                        collection: serializeCollection(collection)
                    })
                });
            },

            update: function (collection) {
                postUpdate({
                    url: '/config/collections/' + collection.id,
                    data: JSON.stringify({
                        frontIds: collection.frontIds(),
                        collection: serializeCollection(collection)
                    })
                });
            }
        },

        front: {
            create: function (front, collection) {
                var serialized = serializeFront(front);

                /** We instead pass through the initial collection as a separate parameter */
                delete serialized.collections;

                postUpdate({
                    url: '/config/fronts',
                    data: JSON.stringify(_.extend({
                        initialCollection: serializeCollection(collection)
                    }, serialized))
                });
            },

            update: function (front) {
                postUpdate({
                    url: '/config/fronts/' + front.id(),
                    data: JSON.stringify(serializeFront(front))
                });
            }
        },

        registerCallback: function (onUpdate) {
            onUpdateCallbacks.push(onUpdate);
        }
    };
});
