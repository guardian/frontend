/* jshint newcap: false */
/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

import constants from 'es6/projects/common/modules/crosswords/constants';
import helpers from 'es6/projects/common/modules/crosswords/helpers';

const Cell = React.createClass({
    onClick (event) {
        event.preventDefault();
        this.props.handleSelect();
    },

    render () {
        const innerNodes = [];
        const top = helpers.gridSize(this.props.y);
        const left = helpers.gridSize(this.props.x);

        if (this.props.number !== undefined) {
            innerNodes.push(
                React.DOM.text({
                    x: left + 1,
                    y: top + constants.numberSize,
                    key: 'number',
                    className: 'crossword__cell-number'
                }, this.props.number)
            );
        }

        if (this.props.value !== undefined) {
            innerNodes.push(React.DOM.text({
                x: left + constants.cellSize / 2,
                y: top + (constants.cellSize + constants.entrySize) / 2,
                key: 'entry',
                className: classNames({
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
                width: constants.cellSize,
                height: constants.cellSize,
                className: classNames({
                    'crossword__cell': true,
                    'crossword__cell--focussed': this.props.isFocussed,
                    'crossword__cell--highlighted': this.props.isHighlighted,
                    'crossword__cell--intersecting': this.props.intersectsFocussedEntry
                })
            }),
            innerNodes
        );
    }
});

export default React.createClass({
    handleSelect (x, y) {
        this.props.onSelect(x, y);
    },

    render () {
        const width = helpers.gridSize(this.props.columns);
        const height = helpers.gridSize(this.props.rows);
        const cells = [];

        _.forEach(_.range(this.props.rows), (y) => {
            _.map(_.range(this.props.columns), (x) => {
                const cellProps = this.props.cells[x][y];

                if (cellProps.isEditable) {
                    cellProps.handleSelect = this.handleSelect.bind(this, x, y);
                    cellProps.x = x;
                    cellProps.y = y;
                    cellProps.key = 'cell_' + x + '_' + y;
                    cellProps.isHighlighted = this.props.isHighlighted(x, y);
                    cellProps.isFocussed = this.props.focussedCell && x === this.props.focussedCell.x &&
                        y === this.props.focussedCell.y;
                    cells.push(Cell(cellProps));
                }
            });
        });

        return React.DOM.svg({
            viewBox: '0 0 ' + width + ' ' + height,
            className: classNames({
                'crossword__grid': true,
                'crossword__grid--focussed': !!this.props.focussedCell
            })
        }, React.DOM.rect({
            x: 0,
            y: 0,
            width: width,
            height: height
        }),
        cells);
    }
});
