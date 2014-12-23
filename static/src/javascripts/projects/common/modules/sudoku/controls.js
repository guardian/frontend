define([
    'common/utils/_',
    'react',
    'common/modules/sudoku/constants'
], function (
    _,
    React,
    constants
) {
    var Button = React.createClass({
        render: function () {
            return React.DOM.g({
                    className: 'sudoku__button'
                },
                React.DOM.rect({
                    className: 'sudoku__button-background',
                    x: this.props.x,
                    y: this.props.y,
                    rx: constants.buttonBorderRadius,
                    ry: constants.buttonBorderRadius,
                    width: constants.buttonSize,
                    height: constants.buttonSize,
                    onClick: this.props.onClick
                }), React.DOM.text({
                    className: 'sudoku__button-text',
                    x: this.props.x + constants.buttonSize / 2,
                    y: this.props.y + constants.buttonTopMargin
                }, this.props.text)
            )
        }
    });

    return React.createClass({
        render: function () {
            var x = this.props.x,
                y = this.props.y,
                buttonsPerRow = 7,
                numberButtons = _.map(_.range(9), function (n) {
                    var col = n % buttonsPerRow,
                        row = Math.floor(n / buttonsPerRow),
                        buttonX = x + col * (constants.buttonSize + constants.buttonMargin),
                        buttonY = y + row * (constants.buttonSize + constants.buttonMargin);

                    return Button({
                        key: 'button_' + n,
                        x: buttonX,
                        y: buttonY,
                        text: n + 1 + "",
                        onClick: function () {
                            console.log("Clicked " + n + 1);
                        }
                    })
            });

            return React.DOM.g({
                className: 'sudoku__controls'
            },
                numberButtons
            );
        }
    });
});
