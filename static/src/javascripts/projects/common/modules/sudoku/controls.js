/* eslint-disable new-cap */
define([
    'react',
    'common/modules/sudoku/constants',
    'lodash/collections/map',
    'lodash/arrays/range'
], function (
    React,
    constants,
    map,
    range) {
    var Button = React.createClass({
        render: function () {
            return React.DOM.g({
                className: 'sudoku__button',
                onClick: this.props.onClick
            },
                React.DOM.rect({
                    className: 'sudoku__button-background',
                    x: this.props.x,
                    y: this.props.y,
                    rx: constants.buttonBorderRadius,
                    ry: constants.buttonBorderRadius,
                    width: constants.buttonSize,
                    height: constants.buttonSize
                }), React.DOM.text({
                    className: 'sudoku__button-text',
                    x: this.props.x + constants.buttonSize / 2,
                    y: this.props.y + constants.buttonTopMargin
                }, this.props.text)
            );
        }
    });

    return React.createClass({
        render: function () {
            var self = this,
                x = this.props.x,
                y = this.props.y,
                buttonsPerRow = 7,
                buttonOffset = function (n) {
                    return n * (constants.buttonSize + constants.buttonMargin);
                },
                numberButtons = map(range(9), function (n) {
                    var col = n % buttonsPerRow,
                        row = Math.floor(n / buttonsPerRow),
                        buttonX = x + buttonOffset(col),
                        buttonY = y + buttonOffset(row);

                    return Button({
                        key: 'button_' + n,
                        x: buttonX,
                        y: buttonY,
                        text: n + 1 + '',
                        onClick: function () {
                            self.props.onClickNumber(n + 1);
                        }
                    });
                });

            return React.DOM.g({
                className: 'sudoku__controls'
            },
                Button({
                    key: 'button_erase',
                    x: x + buttonOffset(2),
                    y: y + buttonOffset(1),
                    text: '-',
                    onClick: function () {
                        self.props.onClickDelete();
                    }
                }),
                numberButtons
            );
        }
    });
});
