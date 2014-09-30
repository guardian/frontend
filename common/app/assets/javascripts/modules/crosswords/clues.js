define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var Clue = React.createClass({
        render: function () {
            var text = this.props.number + ': ' + this.props.clue;

            return React.DOM.li(null,
                (this.props.hasAnswered) ? React.DOM.s(null, text) : text
            );
        }
    });

    return React.createClass({
        render: function () {
            var that = this;

            function cluesByDirection(direction) {
                return _.chain(that.props.clues)
                    .filter(function (clue) {
                        return clue.direction === direction;
                    })
                    .map(function (clue) {
                        return Clue({
                            number: clue.number,
                            clue: clue.clue,
                            hasAnswered: false
                        });
                    });
            }

            return React.DOM.div(null,
                React.DOM.h3(null, 'Across'),
                React.DOM.ul(null, cluesByDirection('across')),
                React.DOM.h3(null, 'Down'),
                React.DOM.ul(null, cluesByDirection('down'))
            )
        }
    });
});
