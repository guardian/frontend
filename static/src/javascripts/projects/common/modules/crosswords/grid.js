// @flow
import React from 'react';
import { gridSize, clueMapKey } from 'common/modules/crosswords/helpers';
import { constants } from 'common/modules/crosswords/constants';
import GridCell from 'common/modules/crosswords/cell';
import { classNames } from 'common/modules/crosswords/classNames';
import type Crossword from 'common/modules/crosswords/crossword';

export type GridProps = {
    rows: number,
    columns: number,
    cells: Array<Array<Cell>>,
    separators: SeparatorMap,
    crossword: Crossword,
    focussedCell: ?Position,
};

// Position at end of previous cell
const createWordSeparator = (
    x: number,
    y: number,
    direction: Direction
): ?React$Node => {
    const top = gridSize(y);
    const left = gridSize(x);
    const borderWidth = 1;

    if (direction === 'across') {
        const width = 1;
        return (
            <rect
                x={left - borderWidth - width}
                y={top}
                key={['sep', direction, x, y].join('_')}
                width={width}
                height={constants.cellSize}
            />
        );
    } else if (direction === 'down') {
        const height = 1;
        return (
            <rect
                x={left}
                y={top - borderWidth - height}
                key={['sep', direction, x, y].join('_')}
                width={constants.cellSize}
                height={height}
            />
        );
    }
};

// Position in-between this and previous cells
const createHyphenSeparator = (
    x: number,
    y: number,
    direction: Direction
): ?React$Node => {
    const top = gridSize(y);
    const left = gridSize(x);
    const borderWidth = 1;
    let width;
    let height;

    if (direction === 'across') {
        width = constants.cellSize / 4;
        height = 1;
        return (
            <rect
                x={left - borderWidth / 2 - width / 2}
                y={top + constants.cellSize / 2 + height / 2}
                key={['sep', direction, x, y].join('_')}
                width={width}
                height={height}
            />
        );
    } else if (direction === 'down') {
        width = 1;
        height = constants.cellSize / 4;
        return (
            <rect
                x={left + constants.cellSize / 2 + width / 2}
                y={top - borderWidth / 2 - height / 2}
                key={['sep', direction, x, y].join('_')}
                width={width}
                height={height}
            />
        );
    }
};

const createSeparator = (
    x: number,
    y: number,
    separatorDescription: ?SeparatorDescription
): ?React$Node => {
    if (separatorDescription) {
        if (separatorDescription.separator === ',') {
            return createWordSeparator(x, y, separatorDescription.direction);
        } else if (separatorDescription.separator === '-') {
            return createHyphenSeparator(x, y, separatorDescription.direction);
        }
    }
};

export const Grid = (props: GridProps): React$Node => {
    const getSeparators = (x: number, y: number): ?SeparatorDescription =>
        props.separators[clueMapKey(x, y)];

    const handleSelect = (x: number, y: number): void =>
        props.crossword.onSelect(x, y);

    const width = gridSize(props.columns);
    const height = gridSize(props.rows);
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
                    <GridCell
                        {...Object.assign(
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
                        )}
                    />
                );

                separators = separators.concat(
                    createSeparator(x, y, getSeparators(x, y))
                );
            }
        })
    );

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={classNames({
                crossword__grid: true,
                'crossword__grid--focussed': !!props.focussedCell,
            })}>
            <rect
                x={0}
                y={0}
                width={width}
                height={height}
                className="crossword__grid-background"
            />
            {cells}
            <g className="crossword__grid__separators">{separators}</g>
        </svg>
    );
};
