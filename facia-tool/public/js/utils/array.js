define([
    'underscore'
], function (
    _
) {
    function combine (destination, previous, comparator, generator) {
        previous = previous.slice();

        return _.map(destination, function (item) {
            var previousItem = _.find(previous, function (old, index) {
                var areTheSame = comparator(old, item);
                if (areTheSame) {
                    previous.splice(index, 1);
                    return true;
                }
                return false;
            });

            if (previousItem) {
                return previousItem;
            } else {
                return generator(item);
            }
        });
    }

    return {
        combine: combine
    };
});
