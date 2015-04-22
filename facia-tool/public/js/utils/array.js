import _ from  'underscore';

function combine (destination, previous, comparator, generator, update) {
    previous = previous.slice();

    return _.map(destination, function (item) {
        var previousIndex, previousItem = _.find(previous, function (old, index) {
            var areTheSame = comparator(old, item);
            if (areTheSame) {
                previousIndex = index;
                return true;
            }
            return false;
        });

        if (previousItem) {
            previous.splice(previousIndex, 1);
            return update(previousItem, item);
        } else {
            return generator(item);
        }
    });
}

export {
    combine
};
