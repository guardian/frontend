define([
    'react',
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
                onClick: this.props.onClearAll,
                key: 'clear',
                text: 'Clear all'
            }));

            if (hasSolutions) {
                controls.grid.unshift(React.createElement(ConfirmButton, {
                    className: buttonClassName + ' ' + buttonGenericClassName,
                    onClick: this.props.onSolution,
                    key: 'solution',
                    text: 'Reveal all'
                }));
                controls.grid.unshift(React.createElement(ConfirmButton, {
                    className: buttonClassName + ' ' + buttonGenericClassName,
                    onClick: this.props.onCheckAll,
                    key: 'checkAll',
                    text: 'Check all'
                }));
            }

            // HIGHLIGHTED CLUE CONTROLS
            if (hasFocus && hasSolutions) {
                controls.clue.unshift(React.createElement('button', {
                    className: buttonClassName + ' ' + buttonCurrentClassName,
                    onClick: undefined.props.onClearSingle,
                    key: 'clear-single'
                }, 'Clear this'));

                controls.clue.unshift(React.createElement(
                    'button', {
                        className: buttonClassName + ' ' + buttonCurrentClassName,
                        onClick: undefined.props.onCheat,
                        key: 'cheat'
                    },
                    'Reveal this'
                ));
                controls.clue.unshift(React.createElement(
                    'button', {
                        className: buttonClassName + ' ' + buttonCurrentClassName,
                        onClick: undefined.props.onCheck,
                        key: 'check'
                    },
                    'Check this'
                ));

                // anagram helper
                controls.clue.push(React.createElement(
                    'button', {
                        className: buttonClassName + ' ' + buttonCurrentClassName,
                        onClick: undefined.props.onToggleAnagramHelper,
                        key: 'anagram'
                    },
                    'Anagram helper'
                ));
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
