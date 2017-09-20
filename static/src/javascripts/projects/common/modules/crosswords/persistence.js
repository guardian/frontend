// @flow

import { local as localStorage } from 'lib/storage';

const localStorageKey = (id: string) => `crosswords.${id}`;

const saveGridState = (id: string, grid: Array<Array<Object>>): boolean => {
    /* Take only the entries from the grid. Other state information like what
       cells are highlighted ought not to be persisted. */
    const entries = grid.map(row => row.map(cell => cell.value));

    try {
        return localStorage.set(localStorageKey(id), entries);
    } catch (e) {
        return false;
    }
};

const loadGridState = (id: string): Array<mixed> =>
    localStorage.get(localStorageKey(id));

export { saveGridState, loadGridState };
