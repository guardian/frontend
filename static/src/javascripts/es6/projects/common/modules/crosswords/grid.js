/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

import helpers from './helpers';
import constants from './constants';

import Cell from './cell';

export default class Grid extends React.Component {

    handleSelect (x, y) {
        this.props.onSelect(x, y);
    }

    render () {
        const width = helpers.gridSize(this.props.columns);
        const height = helpers.gridSize(this.props.rows);
        const cells = [];
        const separators = [];

        _.forEach(_.range(this.props.rows), (y) => {
            _.map(_.range(this.props.columns), (x) => {
                const cellProps = this.props.cells[x][y];

                if (cellProps.isEditable) {
                    cells.push(
                        <Cell {...cellProps}
                            handleSelect = {this.handleSelect.bind(this, x, y)}
                            x = {x}
                            y = {y}
                            key = {`cell_${x}_${y}`}
                            isHighlighted = {this.props.isHighlighted(x, y)}
                            isFocussed = {this.props.focussedCell && x === this.props.focussedCell.x && y === this.props.focussedCell.y}
                        />
                    );

                }

                const cellSeparators = this.props.separators[helpers.clueMapKey(x, y)];
                if (cellSeparators) {
                    const top = helpers.gridSize(y);
                    const left = helpers.gridSize(x);
                    const borderWidth = 1;
                    if (cellSeparators.across) {
                        if (cellSeparators.across === ',') {
                            const width = 1;
                            separators.push(
                                <rect x={left - borderWidth - width}
                                      y={top}
                                      width={width}
                                      height={constants.cellSize}></rect>
                            );
                        } else if (cellSeparators.across === '-') {
                            const width = constants.cellSize / 4;
                            const height = 1;
                            separators.push(
                                <rect x={left - (borderWidth / 2) - (width / 2)}
                                      y={top + (constants.cellSize / 2) + (height / 2)}
                                      width={width}
                                      height={height}></rect>
                            );
                        }
                    }
                    if (cellSeparators.down) {
                        if (cellSeparators.down === ',') {
                            const height = 1;
                            separators.push(
                                <rect x={left}
                                      y={top - borderWidth - height}
                                      width={constants.cellSize}
                                      height={height}></rect>
                            );
                        } else if (cellSeparators.down === '-') {
                            const width = 1;
                            const height = constants.cellSize / 4;
                            separators.push(
                                <rect x={left + (constants.cellSize / 2) + (width / 2)}
                                      y={top - (borderWidth / 2) - (height / 2)}
                                      width={width}
                                      height={height}></rect>
                            );
                        }
                    }
                }
            });
        });

        return (
            <svg viewBox={`0 0 ${width} ${height}`}
                className={classNames({
                    'crossword__grid': true,
                    'crossword__grid--focussed': !!this.props.focussedCell
                })}>
                <rect x={0} y={0} width={width} height={height} />
                {cells}
                {separators}
            </svg>
        );
    }
}
