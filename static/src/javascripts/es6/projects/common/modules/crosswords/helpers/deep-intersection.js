import _ from 'common/utils/_';

const deepIntersection = (array1, array2) =>
    array1.filter(cell1 => array2.some(cell2 => _.isEqual(cell1, cell2)));

export default deepIntersection;
