define([
    'classnames',
    'react',
    'common/utils/_',
    './helpers',
    './constants',
    './cell'
], function (
    classNames,
    React,
    _,
    helpers,
    constants,
    Cell
) {
    var Grid = React.createClass({

        handleSelect: function (x, y) {
            this.props.onSelect(x, y);
        },

        getSeparators: function (x, y) {
            return this.props.separators[helpers.clueMapKey(x, y)];
        },

        // Position at end of previous cell
        createWordSeparator: function (x, y, direction) {
            var top = helpers.gridSize(y);
            var left = helpers.gridSize(x);
            var borderWidth = 1;

            if (direction === 'across') {
                var width = 1;
                return React.createElement('rect', {
                    x: left - borderWidth - width,
                    y: top,
                    width: width,
                    height: constants.cellSize
                });
            } else if (direction === 'down') {
                var height = 1;
                return React.createElement('rect', {
                    x: left,
                    y: top - borderWidth - height,
                    width: constants.cellSize,
                    height: height
                });
            }
        },

        // Position in-between this and previous cells
        createHyphenSeparator: function (x, y, direction) {
            var top = helpers.gridSize(y);
            var left = helpers.gridSize(x);
            var borderWidth = 1;
            var width, height;

            if (direction === 'across') {
                width = constants.cellSize / 4;
                height = 1;
                return React.createElement('rect', {
                    x: left - borderWidth / 2 - width / 2,
                    y: top + constants.cellSize / 2 + height / 2,
                    width: width,
                    height: height
                });
            } else if (direction === 'down') {
                width = 1;
                height = constants.cellSize / 4;
                return React.createElement('rect', {
                    x: left + constants.cellSize / 2 + width / 2,
                    y: top - borderWidth / 2 - height / 2,
                    width: width,
                    height: height
                });
            }
        },

        createSeparator: function (x, y, separator, direction) {
            if (separator === ',') {
                return this.createWordSeparator(x, y, direction);
            } else if (separator === '-') {
                return this.createHyphenSeparator(x, y, direction);
            }
        },

        render: function () {
            var width = helpers.gridSize(this.props.columns);
            var height = helpers.gridSize(this.props.rows);
            var cells = [];
            var separators = [];

            _.forEach(_.range(this.props.rows), function (y) {
                _.map(_.range(this.props.columns), function (x) {
                    var cellProps = this.props.cells[x][y];

                    if (cellProps.isEditable) {
                        cells.push(React.createElement(Cell, _.assign({}, cellProps, {
                            handleSelect: this.handleSelect.bind(this, x, y),
                            x: x,
                            y: y,
                            key: 'cell_' + x + '_' + y,
                            isHighlighted: this.props.isHighlighted(x, y),
                            isFocussed: this.props.focussedCell && x === this.props.focussedCell.x && y === this.props.focussedCell.y
                        }, this)));

                        separators = separators.concat(_.map(this.getSeparators(x, y), function (separator, direction) {
                            return this.createSeparator(x, y, separator, direction);
                        }.bind(this)));
                    }
                }.bind(this));
            }.bind(this));

            return React.createElement(
                'svg', {
                    viewBox: '0 0 ' + width + ' ' + height,
                    className: classNames({
                        'crossword__grid': true,
                        'crossword__grid--focussed': !!this.props.focussedCell
                    })
                },
                React.createElement('rect', {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    className: 'crossword__grid-background'
                }),
                cells,
                React.createElement(
                    'g', {
                        className: 'crossword__grid__separators'
                    },
                    separators
                )
            );
        }
    });

    return Grid;
});
