define([
    'react/addons',
    './confirm-button'
], function (
    React,
    ConfirmButton
) {
    var buttonClassName = 'button button--primary';
    var buttonCurrentClassName = 'button--crossword--current';
    var buttonGenericClassName = 'button--secondary';

    var Controls = React.createClass({
        render: function () {
            var hasSolutions = this.props.hasSolutions;
            var hasFocus = this.props.clueInFocus;
            var controls = {
                clue: [],
                grid: []
            };

            // GRID CONTROLS
            controls.grid.unshift(React.createElement(ConfirmButton, {
                className: buttonClassName + ' ' + buttonGenericClassName,
                onClick: this.props.crossword.onClearAll.bind(this.props.crossword),
                key: 'clear',
                'data-link-name': 'Clear all',
                text: 'Clear all'
            }));

            if (hasSolutions) {
                controls.grid.unshift(React.createElement(ConfirmButton, {
                    className: buttonClassName + ' ' + buttonGenericClassName,
                    onClick: this.props.crossword.onSolution.bind(this.props.crossword),
                    key: 'solution',
                    'data-link-name': 'Reveal all',
                    text: 'Reveal all'
                }));
                controls.grid.unshift(React.createElement(ConfirmButton, {
                    className: buttonClassName + ' ' + buttonGenericClassName,
                    onClick: this.props.crossword.onCheckAll.bind(this.props.crossword),
                    key: 'checkAll',
                    'data-link-name': 'Check all',
                    text: 'Check all'
                }));
            }

            // HIGHLIGHTED CLUE CONTROLS  - published solution
            if (hasFocus) {
                controls.clue.unshift(React.createElement('button', {
                    className: buttonClassName + ' ' + buttonCurrentClassName,
                    onClick: this.props.crossword.onClearSingle.bind(this.props.crossword),
                    key: 'clear-single',
                    'data-link-name': 'Clear this'
                }, 'Clear this'));

                // anagram helper
                controls.clue.push(React.createElement(
                    'button', {
                        className: buttonClassName + ' ' + buttonCurrentClassName,
                        onClick: this.props.crossword.onToggleAnagramHelper.bind(this.props.crossword),
                        key: 'anagram',
                        'data-link-name': 'Show anagram helper'
                    },
                    'Anagram helper'
                ));

                if (hasSolutions) {
                    controls.clue.unshift(React.createElement(
                        'button', {
                            className: buttonClassName + ' ' + buttonCurrentClassName,
                            onClick: this.props.crossword.onCheat.bind(this.props.crossword),
                            key: 'cheat',
                            'data-link-name': 'Reveal this'
                        },
                        'Reveal this'
                    ));
                    controls.clue.unshift(React.createElement(
                        'button', {
                            className: buttonClassName + ' ' + buttonCurrentClassName,
                            onClick: this.props.crossword.onCheck.bind(this.props.crossword),
                            key: 'check',
                            'data-link-name': 'Check this'
                        },
                        'Check this'
                    ));
                }
            }

            return React.createElement(
                'div', {
                    className: 'crossword__controls'
                },
                React.createElement(
                    'div', {
                        className: 'crossword__controls__clue'
                    },
                    controls.clue
                ),
                React.createElement(
                    'div', {
                        className: 'crossword__controls__grid'
                    },
                    controls.grid
                ),
                React.createElement(
                    'div', {
                        className: 'crossword__controls_autosave_label'
                    },
                    'Crosswords are saved automatically'
                )
            );
        }
    });

    return Controls;
});
