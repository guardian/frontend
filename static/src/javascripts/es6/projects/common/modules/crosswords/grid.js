/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

import constants from './constants';
import helpers from './helpers';

import Cell from './cell';

export default class Grid extends React.Component {

    handleSelect (x, y) {
        this.props.onSelect(x, y);
    }

    render () {
        const width = helpers.gridSize(this.props.columns);
        const height = helpers.gridSize(this.props.rows);
        const cells = [];

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
            </svg>
        );
    }
}
