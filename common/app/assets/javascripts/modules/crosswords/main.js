define([
    'common/utils/$',
    'common/utils/_',
    'react',
    'common/modules/crosswords/clues',
    'common/modules/crosswords/grid'
], function (
    $,
    _,
    React,
    Clues,
    Grid
) {
    function buildGrid(rows, columns, entries) {
        var grid = _.map(_.range(columns), function (x) {
            return _.map(_.range(rows), function (y) {
                return {
                    isHighlighted: false,
                    isEditable: false
                };
            });
        });

        _.forEach(entries, function (entry) {
            var x = entry.position.x,
                y = entry.position.y;

            grid[x][y].number = entry.number;

            var isAcross = entry.direction === "across";

            _.forEach(_.range(entry.length), function (delta) {
                var x1 = x, y1 = y;

                if (isAcross) {
                    x1 += delta;
                } else {
                    y1 += delta;
                }

                grid[x1][y1].isEditable = true;
            });
        });

        return grid;
    }

    var Crossword = React.createClass({
        getInitialState: function () {
            var dimensions = this.props.data.dimensions;

            this.columns = dimensions.cols;
            this.rows = dimensions.rows;

            return {
                grid: buildGrid(dimensions.rows, dimensions.cols, this.props.data.entries)
            };
        },

        render: function () {
            return React.DOM.div(null,
                Grid({
                    rows: this.rows,
                    columns: this.columns,
                    cells: this.state.grid
                }),
                Clues({
                    clues: this.props.data.entries
                })
            );
        }
    });

    return function () {
        $('.js-crossword').each(function (element) {
            if (element.hasAttribute('data-crossword-data')) {
                var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
                React.renderComponent(new Crossword({data: crosswordData}), element);
            } else {
                console.warn("JavaScript crossword without associated data", element);
            }
        });
    };
});
