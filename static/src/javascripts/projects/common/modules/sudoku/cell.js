define([
    'react',
    'common/modules/sudoku/constants',
    'common/modules/sudoku/utils',
    'lodash/arrays/compact',
    'lodash/collections/map'
], function (
    React,
    constants,
    utils,
    compact,
    map
) {
    return React.createClass({
        onClick: function (event) {
            this.props.onClick(this.props.x, this.props.y);
            event.preventDefault();
        },

        render: function () {
            var self = this,
                value = this.props.value,
                x = utils.position(this.props.x),
                y = utils.position(this.props.y),
                jottingX = function (n) {
                    return x + constants.jottingXOffset + ((n - 1) % 3) * constants.jottingWidth;
                },
                jottingY = function (n) {
                    return y + constants.jottingYOffset + Math.floor((n - 1) / 3) * constants.jottingHeight;
                },
                innerCells = compact([
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
                    }, value) : null
                ]).concat(map(this.props.jottings, function (n) {
                    return React.DOM.text({
                        key: 'jotting_' + n,
                        x: jottingX(n),
                        y: jottingY(n),
                        className: 'sudoku__cell-jotting',
                        onClick: self.onClick
                    }, n);
                }));

            return React.DOM.g({
                className: React.addons.classSet({
                    'sudoku__cell': true,
                    'sudoku__cell--not-editable': !this.props.isEditable,
                    'sudoku__cell--highlighted': this.props.isHighlighted,
                    'sudoku__cell--focussed': this.props.isFocussed,
                    'sudoku__cell--same-value': this.props.isSameValue,
                    'sudoku__cell--error': this.props.isError
                })
            }, innerCells);
        }
    });
});
