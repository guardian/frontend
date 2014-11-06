define([
    'common/utils/_',
    'common/utils/storage'
], function (
    _,
    storage
) {
    var localStorage = storage.local;

    function localStorageKey(id) {
        return 'crosswords.' + id;
    }

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
            localStorage.set(localStorageKey(id), entries);
        } catch (e) {
            // probably out of space
        }
    }

    function loadGridState(id) {
        return localStorage.get(localStorageKey(id));
    }

    return {
        'saveGridState': saveGridState,
        'loadGridState': loadGridState
    };
});
