import React from 'react/addons';
import helpers from 'common/modules/crosswords/helpers';
import constants from 'common/modules/crosswords/constants';
import classNames from 'common/modules/crosswords/classNames';
const Cell = React.createClass({

    onClick(event) {
        event.preventDefault();
        this.props.handleSelect(this.props.x, this.props.y);
    },

    render() {
        const top = helpers.gridSize(this.props.y);
        const left = helpers.gridSize(this.props.x);

        let cellNumber = null;
        if (this.props.number !== undefined) {
            cellNumber = React.createElement('text', {
                x: left + 1,
                y: top + constants.constants.numberSize,
                key: 'number',
                className: 'crossword__cell-number'
            }, this.props.number);
        }

        let cellValue = null;
        if (this.props.value !== undefined) {
            cellValue = React.createElement('text', {
                x: left + constants.constants.cellSize * .5,
                y: top + constants.constants.cellSize * .675,
                key: 'entry',
                className: classNames({
                    'crossword__cell-text': true,
                    'crossword__cell-text--focussed': this.props.isFocussed,
                    'crossword__cell-text--error': this.props.isError
                }),
                textAnchor: 'middle'
            }, this.props.value);
        }

        return React.createElement('g', {
                onClick: this.onClick
            }, React.createElement('rect', {
                x: left,
                y: top,
                width: constants.constants.cellSize,
                height: constants.constants.cellSize,
                className: classNames({
                    'crossword__cell': true,
                    'crossword__cell--focussed': this.props.isFocussed,
                    'crossword__cell--highlighted': this.props.isHighlighted
                })
            }),
            cellNumber,
            cellValue
        );
    }
});

export default Cell;
