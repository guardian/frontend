import { storage } from '@guardian/libs';

const localStorageKey = (id) => `crosswords.${id}`;

const saveGridState = (id, grid) => {
    /* Take only the entries from the grid. Other state information like what
       cells are highlighted ought not to be persisted. */
    const entries = grid.map(row => row.map(cell => cell.value));

    try {
        return storage.local.set(localStorageKey(id), entries);
    } catch (e) {
        return false;
    }
};

const loadGridState = (id) =>
    storage.local.get(localStorageKey(id));

export { saveGridState, loadGridState };
