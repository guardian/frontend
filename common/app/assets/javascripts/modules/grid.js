define(['common', 'bean'], function (common, bean) {

    var gridHeight = 36,
        gridPadding = 12,
        prefix = 'grid-h-unit-';

    function setGridHeightClass(el) {
        var height = el.offsetHeight,
            gridUnits = Math.ceil(height / (gridHeight + gridPadding)),
            classes = el.className.split(/\s+/),
            newClasses = [];

        classes.map(function(c){
            if (c.indexOf(prefix) !== 0) {
                newClasses.push(c);
            }
        });
        newClasses.push(prefix + gridUnits);
        el.className = newClasses.join(' ');
    }

    function Grid(context) {

        // This snaps individual elements to the grid
        Array.prototype.forEach.call(context.querySelectorAll('.snap-to-grid'), setGridHeightClass);

        // This is a general purpose classname to snap all the children to grid
        Array.prototype.forEach.call(context.querySelectorAll('.snap-children-to-grid > *'), setGridHeightClass);
    }

    return Grid;
});