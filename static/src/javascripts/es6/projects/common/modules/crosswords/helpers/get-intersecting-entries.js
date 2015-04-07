import _ from 'common/utils/_';

import helpers from '../helpers';
import deepIntersection from './deep-intersection';

export default (entries, focussed) => {
    const focussedCells = focussed ? helpers.cellsForEntry(focussed) : [];
    const entryHasIntersectingCell = entry => {
        const cells = helpers.cellsForEntry(entry);
        const intersecting = deepIntersection(cells, focussedCells);
        return !!intersecting.length;
    };

    const otherEntries = _.difference(entries, focussed ? [focussed] : []);
    const intersectingEntries = otherEntries.filter(entryHasIntersectingCell);

    return intersectingEntries;
};
