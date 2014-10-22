define([
    'common/utils/_'
], function (
    _
) {
    function supportsLocalStorage() {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    }

    function localStorageKey(id) {
        return 'crosswords.' + id;
    }

    function saveGridState(id, grid) {
        if (supportsLocalStorage()) {
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
                window.localStorage[localStorageKey(id)] = JSON.stringify(entries);
            } catch (e) {
                // probably out of space
            }
        }
    }

    function loadGridState(id) {
        var data;

        if (supportsLocalStorage()) {
            data = window.localStorage[localStorageKey(id)];

            if (data) {
                return JSON.parse(data);
            }
        }
    }

    return {
        'saveGridState': saveGridState,
        'loadGridState': loadGridState
    };
});
