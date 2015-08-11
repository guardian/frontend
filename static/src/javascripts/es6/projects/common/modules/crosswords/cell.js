import React from 'react';
import classNames from 'classnames';

import helpers from './helpers';
import constants from './constants';

export default class Cell extends React.Component {

    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick (event) {
        event.preventDefault();
        this.props.handleSelect();
    }

    render () {
        const top = helpers.gridSize(this.props.y);
        const left = helpers.gridSize(this.props.x);

        let cellNumber = null;
        if (this.props.number !== undefined) {
            cellNumber = (
                <text
                    x={left + 1}
                    y={top + constants.numberSize}
                    key='number'
                    className='crossword__cell-number'>
                    {this.props.number}
                </text>
            );
        }

        let cellValue = null;
        if (this.props.value !== undefined) {
            cellValue = (
                <text
                    x={left + (constants.cellSize * .315)}
                    y={top + (constants.cellSize * .675)}
                    key='entry'
                    className={classNames({
                        'crossword__cell-text': true,
                        'crossword__cell-text--error': this.props.isError
                    })}>
                    {this.props.value}
                </text>
            );
        }

        const createHyphenSeparator = ({ shouldRotate } = { shouldRotate: false }) => {
            const width = constants.cellSize / 3;
            const height = 1;
            const borderWidth = 1;
            const xOffset = (borderWidth / 2) + (width / 2);
            const yOffset = ((constants.cellSize / 2) - (height / 2));

            return (
                <rect
                    x={left + (shouldRotate ? yOffset : (xOffset * -1))}
                    y={top + (shouldRotate ? (xOffset * -1) : yOffset)}
                    width={shouldRotate ? height : width}
                    height={shouldRotate ? width : height}></rect>
            );
        };

        const createWordSeparator = ({ shouldRotate } = { shouldRotate: false }) => {
            const width = 1;
            const height = constants.cellSize;
            const xOffset = constants.cellSize - width;

            return (
                <rect
                    x={left + (shouldRotate ? 0 : xOffset)}
                    y={top + (shouldRotate ? xOffset : 0)}
                    width={shouldRotate ? height : width}
                    height={shouldRotate ? width : height}></rect>
            );
        };

        const separators = [];
        if (this.props.isHorizontalHyphenSeparator) {
            separators.push(createHyphenSeparator());
        } else if (this.props.isHorizontalWordSeparator) {
            separators.push(createWordSeparator());
        }
        if (this.props.isVerticalHyphenSeparator) {
            separators.push(createHyphenSeparator({ shouldRotate: true }));
        } else if (this.props.isVerticalWordSeparator) {
            separators.push(createWordSeparator({ shouldRotate: true }));
        }

        return (
            <g onClick={this.onClick}>
                <rect
                    x={left}
                    y={top}
                    width={constants.cellSize}
                    height={constants.cellSize}
                    className={classNames({
                        'crossword__cell': true,
                        'crossword__cell--focussed': this.props.isFocussed,
                        'crossword__cell--highlighted': this.props.isHighlighted
                    })}>
                </rect>
                {separators}
                {cellNumber}
                {cellValue}
            </g>
        );
    }
}
