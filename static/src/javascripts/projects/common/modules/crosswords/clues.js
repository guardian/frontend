define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var classSet = React.addons.classSet,
        Clue = React.createClass({
            render: function () {
                return React.DOM.li({className: classSet({
                        'crossword__clue': true,
                        'crossword__clue--answered': this.props.hasAnswered
                    })},
                    React.DOM.span({className: 'crossword__clue__number'}, this.props.number),
                    React.DOM.span({className: 'crossword__clue__text'}, this.props.clue)
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
            );
        }
    });
});
