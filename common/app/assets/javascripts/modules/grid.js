define(['common', 'bean'], function (common, bean) {

    function Grid(context) {
        var gridHeight = 36,
            gridPadding = 12;

        // This snaps individual elements to the grid
        common.$g('.snap-to-grid', context).each(function(el) {
            var height = el.offsetHeight,
                gridUnits = Math.ceil(height/(gridHeight+gridPadding));

            el.className += ' grid-h-unit-' + gridUnits;
        });

        // This is a general purpose classname to snap all the children to grid
        common.$g('.snap-children-to-grid', context).each(function(el) {
            Array.prototype.forEach.call(el.children, function(el) {
                var height = el.offsetHeight,
                    gridUnits = Math.ceil(height/(gridHeight+gridPadding));

                el.className += ' grid-h-unit-' +gridUnits;
            });
        });
    };

    return Grid;
});