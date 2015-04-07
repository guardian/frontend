/* jshint newcap: false */
import _ from 'common/utils/_';
import React from 'react/addons';

var classSet = React.addons.classSet,
    Clue = React.createClass({
        onClick: function (event) {
            event.preventDefault();
            this.props.focusClue();
        },

        render: function () {
            return React.DOM.li({
                className: classSet({
                    'crossword__clue': true,
                    'crossword__clue--answered': this.props.hasAnswered,
                    'crossword__clue--selected': this.props.isSelected
                }),
                onClick: this.onClick,
                value: this.props.number,
                dangerouslySetInnerHTML: {
                    '__html': this.props.clue
                }
            });
        }
    });

export default React.createClass({
    render: function () {
        var that = this,
            headerClass = 'crossword__clues-header';

        function cluesByDirection(direction) {
            return _.chain(that.props.clues)
                .filter(function (clue) {
                    return clue.entry.direction === direction;
                })
                .map(function (clue) {
                    return Clue({
                        number: clue.entry.number + '.',
                        clue: clue.entry.clue,
                        hasAnswered: clue.hasAnswered,
                        isSelected: clue.isSelected,
                        focusClue: function () {
                            that.props.focusClue(clue.entry.position.x, clue.entry.position.y, direction);
                        }
                    });
                });
        }

        return React.DOM.div({
            className: 'crossword__clues'
        },
        React.DOM.div({
            className: 'crossword__clues--across'
        },
        React.DOM.h3({
            className: headerClass
        }, 'Across'),
        React.DOM.ol({
            className: 'crossword__clues-list'
        }, cluesByDirection('across'))),
        React.DOM.div({
            className: 'crossword__clues--down'
        },
        React.DOM.h3({
            className: headerClass
        }, 'Down'),
        React.DOM.ol({
            className: 'crossword__clues-list'
        }, cluesByDirection('down'))));
    }
});

