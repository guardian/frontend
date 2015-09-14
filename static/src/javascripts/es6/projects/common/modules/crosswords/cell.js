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
                    x={left + (constants.cellSize * .5)}
                    y={top + (constants.cellSize * .675)}
                    key='entry'
                    className={classNames({
                        'crossword__cell-text': true,
                        'crossword__cell-text--focussed': this.props.isFocussed,
                        'crossword__cell-text--error': this.props.isError
                    })}
                    textAnchor='middle'>
                    {this.props.value}
                </text>
            );
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
                {cellNumber}
                {cellValue}
            </g>
        );
    }
}
