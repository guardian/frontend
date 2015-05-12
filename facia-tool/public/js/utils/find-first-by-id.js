import _ from 'underscore';
import ko from 'knockout';

export default function(observableArray, id) {
    return ko.utils.arrayFirst(observableArray(), function(c) { return _.result(c, 'id') === id; });
}
