import _ from 'underscore';

export default function(observableArray, id) {
    return observableArray.remove(function(item) {
        return _.result(item, 'id') === id;
    })[0];
}
