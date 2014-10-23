/* jshint newcap: false */
define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var classSet = React.addons.classSet,
        Cell = React.createClass({
            onClick: function (event) {
                event.preventDefault();
                this.props.handleSelect();
            },

            render: function () {
                var innerNodes = [],
                    top = this.props.y * 32 + 1,
                    left = this.props.x * 32 + 1;

                if (this.props.number !== undefined) {
                    innerNodes.push(
                        React.DOM.text({
                            x: left + 1,
                            y: top + 8,
                            key: 'number',
                            className: 'crossword__cell-number'
                        }, this.props.number)
                    );
                }

                if (this.props.value !== undefined) {
                    innerNodes.push(React.DOM.text({
                        x: left + 31 / 2,
                        y: top + 31 / 2 + 5,
                        key: 'entry',
                        className: classSet({
                            'crossword__cell-text': true,
                            'crossword__cell-text--error': this.props.isError
                        })
                    }, this.props.value));
                }

                return React.DOM.g({
                    onClick: this.onClick
                },
                    React.DOM.rect({
                        x: left,
                        y: top,
                        width: 31,
                        height: 31,
                        className: classSet({
                            'crossword__cell': true,
                            'crossword__cell--focussed': this.props.isFocussed,
                            'crossword__cell--highlighted': this.props.isHighlighted
                        })
                    }),
                    innerNodes
                );
            }
        });

    return React.createClass({
        handleSelect: function (x, y) {
            this.props.onSelect(x, y);
        },

        render: function () {
            var that = this,
                width = this.props.columns * 32 + 1,
                height = this.props.rows * 32 + 1,
                cells = [];

            _.forEach(_.range(this.props.rows), function (y) {
                _.map(_.range(that.props.columns), function (x) {
                    var cellProps = that.props.cells[x][y];

                    if (cellProps.isEditable) {
                        cellProps.handleSelect = that.handleSelect.bind(that, x, y);
                        cellProps.x = x;
                        cellProps.y = y;
                        cellProps.key = 'cell_' + x + '_' + y;
                        cellProps.isHighlighted = that.props.isHighlighted(x, y);
                        cellProps.isFocussed = that.props.focussedCell && x === that.props.focussedCell.x &&
                            y === that.props.focussedCell.y;
                        cells.push(Cell(cellProps));
                    }
                });
            });

            return React.DOM.svg({
                width: width,
                height: height,
                className: 'crossword__grid'
            }, React.DOM.rect({
                x: 0,
                y: 0,
                width: width,
                height: height
            }),
            cells);
        }
    });
});
