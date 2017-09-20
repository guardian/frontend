import React from 'react/addons';
import helpers from 'common/modules/crosswords/helpers';
import constants from 'common/modules/crosswords/constants';
import Cell from 'common/modules/crosswords/cell';
import classNames from 'common/modules/crosswords/classNames';
import forEach from 'lodash/collections/forEach';
import range from 'lodash/arrays/range';
import map from 'lodash/collections/map';
import assign from 'lodash/objects/assign';
const Grid = React.createClass({

    getSeparators(x, y) {
        return this.props.separators[helpers.clueMapKey(x, y)];
    },

    handleSelect(x, y) {
        this.props.crossword.onSelect(x, y);
    },

    // Position at end of previous cell
    createWordSeparator(x, y, direction) {
        const top = helpers.gridSize(y);
        const left = helpers.gridSize(x);
        const borderWidth = 1;

        if (direction === 'across') {
            const width = 1;
            return React.createElement('rect', {
                x: left - borderWidth - width,
                y: top,
                key: ['sep', direction, x, y].join('_'),
                width,
                height: constants.constants.cellSize
            });
        } else if (direction === 'down') {
            const height = 1;
            return React.createElement('rect', {
                x: left,
                y: top - borderWidth - height,
                key: ['sep', direction, x, y].join('_'),
                width: constants.constants.cellSize,
                height
            });
        }
    },

    // Position in-between this and previous cells
    createHyphenSeparator(x, y, direction) {
        const top = helpers.gridSize(y);
        const left = helpers.gridSize(x);
        const borderWidth = 1;
        let width, height;

        if (direction === 'across') {
            width = constants.constants.cellSize / 4;
            height = 1;
            return React.createElement('rect', {
                x: left - borderWidth / 2 - width / 2,
                y: top + constants.constants.cellSize / 2 + height / 2,
                width,
                height
            });
        } else if (direction === 'down') {
            width = 1;
            height = constants.constants.cellSize / 4;
            return React.createElement('rect', {
                x: left + constants.constants.cellSize / 2 + width / 2,
                y: top - borderWidth / 2 - height / 2,
                width,
                height
            });
        }
    },

    createSeparator(x, y, separator, direction) {
        if (separator === ',') {
            return this.createWordSeparator(x, y, direction);
        } else if (separator === '-') {
            return this.createHyphenSeparator(x, y, direction);
        }
    },

    render() {
        const width = helpers.gridSize(this.props.columns);
        const height = helpers.gridSize(this.props.rows);
        const cells = [];
        let separators = [];

        forEach(range(this.props.rows), function(y) {
            map(range(this.props.columns), function(x) {
                const cellProps = this.props.cells[x][y];

                if (cellProps.isEditable) {
                    cells.push(React.createElement(Cell, assign({}, cellProps, {
                        handleSelect: this.handleSelect,
                        x,
                        y,
                        key: 'cell_' + x + '_' + y,
                        isHighlighted: this.props.crossword.isHighlighted(x, y),
                        isFocussed: this.props.focussedCell && x === this.props.focussedCell.x && y === this.props.focussedCell.y
                    }, this)));

                    separators = separators.concat(map(this.getSeparators(x, y), function(separator, direction) {
                        return this.createSeparator(x, y, separator, direction);
                    }, this));
                }
            }, this);
        }, this);

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
                width,
                height,
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

export default Grid;
