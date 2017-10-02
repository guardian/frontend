// @flow
import { createClass, createElement } from 'react/addons';
import helpers from 'common/modules/crosswords/helpers';
import { constants } from 'common/modules/crosswords/constants';
import { classNames } from 'common/modules/crosswords/classNames';

const Cell = createClass({
    onClick(event) {
        event.preventDefault();
        this.props.handleSelect(this.props.x, this.props.y);
    },

    render() {
        const top = helpers.gridSize(this.props.y);
        const left = helpers.gridSize(this.props.x);

        let cellNumber = null;
        if (this.props.number !== undefined) {
            cellNumber = createElement(
                'text',
                {
                    x: left + 1,
                    y: top + constants.numberSize,
                    key: 'number',
                    className: 'crossword__cell-number',
                },
                this.props.number
            );
        }

        let cellValue = null;
        if (this.props.value !== undefined) {
            cellValue = createElement(
                'text',
                {
                    x: left + constants.cellSize * 0.5,
                    y: top + constants.cellSize * 0.675,
                    key: 'entry',
                    className: classNames({
                        'crossword__cell-text': true,
                        'crossword__cell-text--focussed': this.props.isFocussed,
                        'crossword__cell-text--error': this.props.isError,
                    }),
                    textAnchor: 'middle',
                },
                this.props.value
            );
        }

        return createElement(
            'g',
            {
                onClick: this.onClick,
            },
            createElement('rect', {
                x: left,
                y: top,
                width: constants.cellSize,
                height: constants.cellSize,
                className: classNames({
                    crossword__cell: true,
                    'crossword__cell--focussed': this.props.isFocussed,
                    'crossword__cell--highlighted': this.props.isHighlighted,
                }),
            }),
            cellNumber,
            cellValue
        );
    },
});

export default Cell;
