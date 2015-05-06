import React from 'react';
import classNames from 'classnames';

import helpers from './helpers';
import constants from './constants';

export default class extends React.Component {

    constructor (props) {
        super (props);
        this.onClick = this.onClick.bind(this);
    }

    onClick (event) {
        event.preventDefault();
        this.props.handleSelect();
    }

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
                        'crossword__cell--highlighted': this.props.isHighlighted,
                        'crossword__cell--intersecting': this.props.intersectsFocussedEntry
                    })}>
                </rect>
                {innerNodes}
            </g>
        );
    }
};
