define([
    'common/utils/_',
    'common/utils/storage'
], function (
    _,
    storage
) {
    var localStorage = storage.local;

    var localStorageKey = function (id) {
        return 'crosswords.' + id;
    };

    function saveGridState(id, grid) {
        /**
         * Take only the entries from the grid. Other state information like what cells are highlighted ought not
         * to be persisted.
         */
        var entries = _.map(grid, function (row) {
            return _.map(row, function (cell) {
                return cell.value;
            });
        });

        try {
            return localStorage.set(localStorageKey(id), entries);
        } catch (e) {
            return false;
        }
    }

    var loadGridState = function (id) {
        return localStorage.get(localStorageKey(id));
    };

    return {
        'saveGridState': saveGridState,
        'loadGridState': loadGridState
    };
});
