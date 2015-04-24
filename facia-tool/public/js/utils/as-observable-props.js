import _ from 'underscore';
import ko from 'knockout';

export default function(props) {
    return _.object(_.map(props, function(prop) {
        return [prop, ko.observable()];
    }));
}
