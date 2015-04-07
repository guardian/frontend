import _ from 'common/utils/_';
import storage from 'common/utils/storage';

var localStorage = storage.local;

function localStorageKey(id) {
    return 'crosswords.' + id;
}

function saveGridState(id, grid) {
    /**
     * Take only the entries from the grid. Other state information like what cells are highlighted ought not
     * to be persisted.
     */
    const entries = _.map(grid, (row) => _.map(row, (cell) => cell.value));

    try {
        localStorage.set(localStorageKey(id), entries);
    } catch (e) {
        // probably out of space
    }
}

function loadGridState(id) {
    return localStorage.get(localStorageKey(id));
}

export default {
    'saveGridState': saveGridState,
    'loadGridState': loadGridState
};
