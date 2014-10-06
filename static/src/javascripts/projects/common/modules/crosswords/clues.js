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
                return React.DOM.li({
                    className: classSet({
                        'crossword__clues__clue': true,
                        'crossword__clues__clue--answered': this.props.hasAnswered
                    })
                },
                    React.DOM.span({className: 'crossword__clues__clue__number'}, this.props.number),
                    React.DOM.span({className: 'crossword__clues__clue__text'}, this.props.clue)
                );
            }
        });

    return React.createClass({
        render: function () {
            var that = this,
                headerClass = 'crossword__clues__header';

            function cluesByDirection(direction) {
                return _.chain(that.props.clues)
                    .filter(function (clue) {
                        return clue.direction === direction;
                    })
                    .map(function (clue) {
                        return Clue({
                            number: clue.number + '.',
                            clue: clue.clue,
                            hasAnswered: false
                        });
                    });
            }

            return React.DOM.div({
                    className: 'crossword__clues'
                },
                React.DOM.h3({
                    className: headerClass
                }, 'Across'),
                React.DOM.ul(null, cluesByDirection('across')),
                React.DOM.h3({
                    className: headerClass
                }, 'Down'),
                React.DOM.ul(null, cluesByDirection('down'))
            );
        }
    });
});
