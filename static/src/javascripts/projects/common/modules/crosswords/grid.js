// @flow
import React from 'react/addons';
import helpers from 'common/modules/crosswords/helpers';
import { constants } from 'common/modules/crosswords/constants';
import Cell from 'common/modules/crosswords/cell';
import classNames from 'common/modules/crosswords/classNames';
import type Crossword from 'common/modules/crosswords/crossword';

type Direction = 'across' | 'down';

type Separator = '-' | ',';

type SeparatorDescription = {
    direction: Direction,
    separator: Separator,
};

type GridProps = {
    rows: number,
    columns: number,
    cells: Array<Array<Object>>,
    separators: Array<SeparatorDescription>,
    crossword: Crossword,
    focussedCell: Object,
};

// Position at end of previous cell
const createWordSeparator = (
    x: number,
    y: number,
    direction: Direction
): ?React.Element => {
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
};

// Position in-between this and previous cells
const createHyphenSeparator = (
    x: number,
    y: number,
    direction: Direction
): ?React.Element => {
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
};

const createSeparator = (
    x: number,
    y: number,
    separatorDescription: ?SeparatorDescription
): ?React.Element => {
    if (separatorDescription) {
        if (separatorDescription.separator === ',') {
            return createWordSeparator(x, y, separatorDescription.direction);
        } else if (separatorDescription.separator === '-') {
            return createHyphenSeparator(x, y, separatorDescription.direction);
        }
    }
};

export const Grid = (props: GridProps): React.Element<*> => {
    const getSeparators = (x: number, y: number): ?SeparatorDescription =>
        props.separators[helpers.clueMapKey(x, y)];

    const handleSelect = (x: number, y: number): void =>
        props.crossword.onSelect(x, y);

    const width = helpers.gridSize(props.columns);
    const height = helpers.gridSize(props.rows);
    const cells = [];
    let separators = [];

    const range = n => Array.from({ length: n }, (value, key) => key);

    // This is needed to appease ESLint (https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md#false-positives-sfc)
    const cellsIn = props.cells;

    range(props.rows).forEach(y =>
        range(props.columns).forEach(x => {
            const cellProps = cellsIn[x][y];

            if (cellProps.isEditable) {
                const isHighlighted = props.crossword.isHighlighted(x, y);
                cells.push(
                    React.createElement(
                        Cell,
                        Object.assign(
                            {},
                            cellProps,
                            {
                                handleSelect,
                                x,
                                y,
                                key: `cell_${x}_${y}`,
                                isHighlighted,
                                isFocussed:
                                    props.focussedCell &&
                                    x === props.focussedCell.x &&
                                    y === props.focussedCell.y,
                            },
                            this
                        )
                    )
                );

                separators = separators.concat(
                    createSeparator(x, y, getSeparators(x, y))
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
                'crossword__grid--focussed': !!props.focussedCell,
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
};
