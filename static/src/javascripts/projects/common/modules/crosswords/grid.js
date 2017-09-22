// @flow
import React from 'react/addons';
import helpers from 'common/modules/crosswords/helpers';
import { constants } from 'common/modules/crosswords/constants';
import Cell from 'common/modules/crosswords/cell';
import classNames from 'common/modules/crosswords/classNames';

export class Grid extends React.Component {
    // Position at end of previous cell
    static createWordSeparator(
        x: number,
        y: number,
        direction: string
    ): ?Element {
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
                height: constants.cellSize,
            });
        } else if (direction === 'down') {
            const height = 1;
            return React.createElement('rect', {
                x: left,
                y: top - borderWidth - height,
                key: ['sep', direction, x, y].join('_'),
                width: constants.cellSize,
                height,
            });
        }
    }

    // Position in-between this and previous cells
    static createHyphenSeparator(
        x: number,
        y: number,
        direction: string
    ): ?Element {
        const top = helpers.gridSize(y);
        const left = helpers.gridSize(x);
        const borderWidth = 1;
        let width;
        let height;

        if (direction === 'across') {
            width = constants.cellSize / 4;
            height = 1;
            return React.createElement('rect', {
                x: left - borderWidth / 2 - width / 2,
                y: top + constants.cellSize / 2 + height / 2,
                width,
                height,
            });
        } else if (direction === 'down') {
            width = 1;
            height = constants.cellSize / 4;
            return React.createElement('rect', {
                x: left + constants.cellSize / 2 + width / 2,
                y: top - borderWidth / 2 - height / 2,
                width,
                height,
            });
        }
    }

    static createSeparator(
        x: number,
        y: number,
        separatorDescription: ?Object
    ): ?Element {
        if (separatorDescription) {
            if (separatorDescription.separator === ',') {
                return Grid.createWordSeparator(
                    x,
                    y,
                    separatorDescription.direction
                );
            } else if (separatorDescription.separator === '-') {
                return Grid.createHyphenSeparator(
                    x,
                    y,
                    separatorDescription.direction
                );
            }
        }
    }

    getSeparators(x: number, y: number): ?Object {
        return this.props.separators[helpers.clueMapKey(x, y)];
    }

    handleSelect(x: number, y: number): void {
        this.props.crossword.onSelect(x, y);
    }

    render(): Element {
        const width = helpers.gridSize(this.props.columns);
        const height = helpers.gridSize(this.props.rows);
        const cells = [];
        let separators = [];

        const range = n => Array.from({ length: n }, (value, key) => key);

        const self = this;
        range(this.props.rows).forEach(y =>
            range(this.props.columns).forEach(x => {
                const cellProps = this.props.cells[x][y];

                if (cellProps.isEditable) {
                    const isHighlighted = this.props.crossword.isHighlighted(
                        x,
                        y
                    );
                    cells.push(
                        React.createElement(
                            Cell,
                            Object.assign(
                                {},
                                cellProps,
                                {
                                    handleSelect: this.handleSelect,
                                    x,
                                    y,
                                    key: `cell_${x}_${y}`,
                                    isHighlighted,
                                    isFocussed:
                                        this.props.focussedCell &&
                                        x === this.props.focussedCell.x &&
                                        y === this.props.focussedCell.y,
                                },
                                this
                            )
                        )
                    );

                    separators = separators.concat(
                        Grid.createSeparator(x, y, self.getSeparators(x, y))
                    );
                }
            })
        );

        return React.createElement(
            'svg',
            {
                viewBox: `0 0 ${width} ${height}`,
                className: classNames({
                    crossword__grid: true,
                    'crossword__grid--focussed': !!this.props.focussedCell,
                }),
            },
            React.createElement('rect', {
                x: 0,
                y: 0,
                width,
                height,
                className: 'crossword__grid-background',
            }),
            cells,
            React.createElement(
                'g',
                {
                    className: 'crossword__grid__separators',
                },
                separators
            )
        );
    }
}
