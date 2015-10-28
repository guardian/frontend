define([
    'react',
    'classnames',
    './helpers',
    './constants'
], function (
    React,
    classNames,
    helpers,
    constants
) {
    var Cell = React.createClass({

        componentDidMount: function () {
            this.onClick = this.onClick.bind(this);
        },

        onClick: function (event) {
            event.preventDefault();
            this.props.handleSelect(this.props.x, this.props.y);
        },

        render: function () {
            var top = helpers.gridSize(this.props.y);
            var left = helpers.gridSize(this.props.x);

            var cellNumber = null;
            if (this.props.number !== undefined) {
                cellNumber = React.createElement('text', {
                    x: left + 1,
                    y: top + constants.numberSize,
                    key: 'number',
                    className: 'crossword__cell-number'
                }, this.props.number);
            }

            var cellValue = null;
            if (this.props.value !== undefined) {
                cellValue = React.createElement('text', {
                    x: left + constants.cellSize * .5,
                    y: top + constants.cellSize * .675,
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
                    width: constants.cellSize,
                    height: constants.cellSize,
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

    return Cell;
});
