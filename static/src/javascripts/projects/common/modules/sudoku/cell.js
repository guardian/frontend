/* jshint newcap: false */
define([
    'common/utils/_',
    'react',
    'common/modules/crosswords/constants',
    'common/modules/crosswords/utils'
], function (
    _,
    React,
    constants,
    utils
) {
    return React.createClass({
        onClick: function (event) {
            this.props.onClick(this.props.x, this.props.y)
            event.preventDefault();
        },

        render: function () {
            var value = this.props.value,
                x = utils.position(this.props.x),
                y = utils.position(this.props.y);

            var innerCells = _.compact([
                React.DOM.rect({
                    key: 'background',
                    x: x,
                    y: y,
                    width: constants.cellSize,
                    height: constants.cellSize,
                    onClick: this.onClick
                }),
                value ? React.DOM.text({
                    key: 'value',
                    x: x + constants.textXOffset,
                    y: y + constants.textYOffset,
                    className: 'sudoku__cell-text',
                    onClick: this.onClick
                }, value): null
            ]);

            return React.DOM.g({
                className: React.addons.classSet({
                    sudoku__cell: true,
                    'sudoku__cell--not-editable': !this.props.isEditable,
                    'sudoku__cell--highlighted': this.props.isHighlighted,
                    'sudoku__cell--focussed': this.props.isFocussed,
                    'sudoku__cell--same-value': this.props.isSameValue
                })
            }, innerCells);
        }
    });
});
