/* jshint newcap: false */
import classNames from 'classnames';
import React from 'react';

import _ from 'common/utils/_';

const Clue = React.createClass({
        onClick (event) {
            event.preventDefault();
            this.props.focusClue();
        },

        render () {
            return React.DOM.li({
                className: classNames({
                    'crossword__clue': true,
                    'crossword__clue--answered': this.props.hasAnswered,
                    'crossword__clue--selected': this.props.isSelected
                }),
                onClick: this.onClick,
                value: parseInt(this.props.number, 10),
                dangerouslySetInnerHTML: {
                    '__html': this.props.clue
                }
            });
        }
    });

export default React.createClass({
    render () {
        const headerClass = 'crossword__clues-header';
        const cluesByDirection = (direction) => _.chain(this.props.clues)
            .filter((clue) => clue.entry.direction === direction)
            .map((clue) => Clue({
                number: clue.entry.number + '.',
                clue: clue.entry.clue,
                hasAnswered: clue.hasAnswered,
                isSelected: clue.isSelected,
                focusClue: () => {
                    this.props.focusClue(clue.entry.position.x, clue.entry.position.y, direction);
                }
            })
        );

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

