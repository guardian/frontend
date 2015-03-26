/* jshint newcap: false */
import React from 'react';

import $ from 'common/utils/$';
import _ from 'common/utils/_';
import bean from 'bean';
import bonzo from 'bonzo';

import Clues from './clues';
import Controls from './controls';
import FocussedClue from './focussedClue.jsx!';
import Grid from './grid';
import helpers from './helpers';
import keycodes from './keycodes';
import persistence from './persistence';
import loadFont from './font';

// make react available to dev tool
window.React || (window.React = React);

var Crossword = React.createClass({
    getInitialState: function () {
        var dimensions = this.props.data.dimensions;

        this.columns = dimensions.cols;
        this.rows = dimensions.rows;
        this.clueMap = helpers.buildClueMap(this.props.data.entries);

        loadFont();

        return {
            grid: helpers.buildGrid(
                dimensions.rows,
                dimensions.cols,
                this.props.data.entries,
                persistence.loadGridState(this.props.data.id)
            ),
            cellInFocus: null,
            directionOfEntry: null
        };
    },

    setCellValue: function (x, y, value) {
        var cell = this.state.grid[x][y];

        cell.value = value;
        cell.isError = false;
        this.forceUpdate();
    },

    onKeyDown: function (event) {
        var cell = this.state.cellInFocus;

        if (event.keyCode === keycodes.tab) {
            event.preventDefault();
            if (event.shiftKey) {
                this.focusPreviousClue();
            } else {
                this.focusNextClue();
            }
        } else if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            if (event.keyCode === keycodes.backspace) {
                this.setCellValue(cell.x, cell.y, null);
                this.save();
                this.focusPrevious();
            } else if (event.keyCode === keycodes.left) {
                this.moveFocus(-1, 0);
            } else if (event.keyCode === keycodes.up) {
                this.moveFocus(0, -1);
            } else if (event.keyCode === keycodes.right) {
                this.moveFocus(1, 0);
            } else if (event.keyCode === keycodes.down) {
                this.moveFocus(0, 1);
            } else if (event.keyCode >= keycodes.a && event.keyCode <= keycodes.z) {
                this.setCellValue(cell.x, cell.y, String.fromCharCode(event.keyCode));
                this.save();
                this.focusNext();
            }
        }
    },

    indexOfClueInFocus: function () {
        return this.props.data.entries.indexOf(this.clueInFocus());
    },

    focusPreviousClue: function () {
        var i = this.indexOfClueInFocus(),
            entries = this.props.data.entries,
            newClue;

        if (i !== -1) {
            newClue = entries[(i === 0) ? entries.length - 1 : i - 1];
            this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
        }
    },

    focusNextClue: function () {
        var i = this.indexOfClueInFocus(),
            entries = this.props.data.entries,
            newClue;

        if (i !== -1) {
            newClue = entries[(i === entries.length - 1) ? 0 : i + 1];
            this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
        }
    },

    moveFocus: function (deltaX, deltaY) {
        var cell = this.state.cellInFocus,
            x = cell.x + deltaX,
            y = cell.y + deltaY,
            direction;

        if (this.state.grid[x] && this.state.grid[x][y] && this.state.grid[x][y].isEditable) {
            if (deltaY !== 0) {
                direction = 'down';
            } else if (deltaX !== 0) {
                direction = 'across';
            };
            this.focusClue(x, y, direction);
        }
    },

    isAcross: function () {
        return this.state.directionOfEntry === 'across';
    },

    focusPrevious: function () {
        if (this.isAcross()) {
            this.moveFocus(-1, 0);
        } else {
            this.moveFocus(0, -1);
        }
    },

    focusNext: function () {
        if (this.isAcross()) {
            this.moveFocus(1, 0);
        } else {
            this.moveFocus(0, 1);
        }
    },

    asPercentage: function (x, y) {
        var width = helpers.gridSize(this.columns),
            height = helpers.gridSize(this.rows);

        return {
            x: 100 * x / width,
            y: 100 * y / height
        };
    },

    focusHiddenInput: function (x, y) {
        var wrapper = this.refs.hiddenInputWrapper.getDOMNode(),
            left = helpers.gridSize(x),
            top = helpers.gridSize(y),
            position = this.asPercentage(left, top);

        /** This has to be done before focus to move viewport accordingly */
        wrapper.style.left = position.x + '%';
        wrapper.style.top = position.y + '%';

        if (document.activeElement !== this.refs.hiddenInput.getDOMNode()) {
            this.refs.hiddenInput.getDOMNode().focus();
        }
    },

    // called when cell is selected (by click or programtically focussed)
    onSelect: function (x, y) {
        var cellInFocus = this.state.cellInFocus,
            clue = this.cluesFor(x, y),
            focussedClue = this.clueInFocus(),
            newDirection,
            isStartOfClue;

        let isInsideFocussedClue = () => focussedClue ? helpers.entryHasCell(focussedClue, x, y) : false;

        if (cellInFocus && cellInFocus.x === x && cellInFocus.y === y) {
            /** User has clicked again on the highlighted cell, meaning we ought to swap direction */
            newDirection = helpers.otherDirection(this.state.directionOfEntry);

            if (clue[newDirection]) {
                this.focusClue(x, y, newDirection);
            }
        } else if (isInsideFocussedClue()) {
            /**
             * If we've clicked inside the currently highlighted clue, then we ought to just shift the cursor
             * to the new cell, not change direction or anything funny.
             */

            this.state.cellInFocus = {x: x, y: y};
            this.forceUpdate();
        } else {
            this.state.cellInFocus = {x: x, y: y};

            let isStartOfClue = (clue) => clue && clue.position.x === x && clue.position.y === y;

            /**
             * If the user clicks on the start of a down clue midway through an across clue, we should
             * prefer to highlight the down clue.
             */
            if (!isStartOfClue(clue.across) && isStartOfClue(clue.down)) {
                newDirection = 'down';
            } else if (clue.across) {
                /** Across is the default focus otherwise */
                newDirection = 'across';
            } else {
                newDirection = 'down';
            }
            this.focusClue(x, y, newDirection);
        }
    },

    focusClue: function (x, y, direction) {
        var clues = this.cluesFor(x, y);

        if (clues && clues[direction]) {
            this.focusHiddenInput(x, y);
            this.state.cellInFocus = {x: x, y: y};
            this.state.directionOfEntry = direction;
            this.forceUpdate();
        }
    },

    cluesFor: function (x, y) {
        return this.clueMap[helpers.clueMapKey(x, y)];
    },

    getContextualCluesFor: function (clue) {
        let clueDirection = clue.direction,
            [x, y] = clueDirection === 'down' ? ['x', 'y'] : ['y', 'x'],
            clueX = clue.position[x],
            clueY = clue.position[y],
            clueLength = clue.length;

        return _.filter(this.props.data.entries, (test) => {
            let testX = test.position[x],
                testY = test.position[y],
                testLength = test.length;

            return testClue.direction !== clueDirection &&
                testX <= clueX && testX + testLength >= clueX &&
                testY >= clueY && testY < clueY + clueLength;
        });
    },

    clueInFocus: function () {
        if (this.state.cellInFocus) {
            var cluesForCell = this.cluesFor(this.state.cellInFocus.x, this.state.cellInFocus.y);
            return cluesForCell[this.state.directionOfEntry];
        } else {
            return null;
        }
    },

    cluesData: function () {
        return _.map(this.props.data.entries, (entry) => ({
            entry: entry,
            hasAnswered: _.every(helpers.cellsForEntry(entry), (position) => {
                return /^[A-Z]$/.test(this.state.grid[position.x][position.y].value);
            }),
            isSelected: this.clueInFocus() === entry
        }));
    },

    save: function () {
        persistence.saveGridState(this.props.data.id, this.state.grid);
    },

    cheat: function (entry) {
        var cells = helpers.cellsForEntry(entry);

        if (entry.solution) {
            _.forEach(cells, (cell, n) => {
                this.state.grid[cell.x][cell.y].value = entry.solution[n];
            });

            this.forceUpdate();
        }
    },

    check: function (entry) {
        var cells = _.map(helpers.cellsForEntry(entry), (cell) => this.state.grid[cell.x][cell.y]),
            badCells;

        if (entry.solution) {
            badCells = _.map(_.filter(_.zip(cells, entry.solution), (cellAndSolution) => {
                var cell = cellAndSolution[0],
                    solution = cellAndSolution[1];
                return /^[A-Z]$/.test(cell.value) && cell.value !== solution;
            }), (cellAndSolution) => cellAndSolution[0]);

            _.forEach(badCells, (cell) => {
                cell.isError = true;
            });

            this.forceUpdate();

            setTimeout(() => {
                _.forEach(badCells, (cell) => {
                    cell.isError = false;
                    cell.value = '';
                });
                this.forceUpdate();
                this.save();
            }, 150);
        }
    },

    onCheat: function () {
        this.cheat(this.clueInFocus());
        this.save();
    },

    onCheck: function () {
        this.check(this.clueInFocus());
    },

    onSolution: function () {
        _.forEach(this.props.data.entries, (entry) => {
            this.cheat(entry);
        });

        this.save();
    },

    onCheckAll: function () {
        _.forEach(this.props.data.entries, (entry) => {
            this.check(entry);
        });
    },

    onClearAll: function () {
        _.forEach(this.state.grid, function (row) {
            _.forEach(row, function (cell) {
                cell.value = '';
            });
        });

        this.forceUpdate();
    },

    hiddenInputValue: function () {
        var cell = this.state.cellInFocus,
            currentValue;

        if (cell) {
            currentValue = this.state.grid[cell.x][cell.y].value;
        }

        return currentValue ? currentValue : '';
    },

    onClickHiddenInput: function () {
        var focussed = this.state.cellInFocus;

        this.onSelect(focussed.x, focussed.y);
    },

    hasSolutions: function () {
        return 'solution' in this.props.data.entries[0];
    },

    render: function () {
        let focussed = this.clueInFocus(),
            isHighlighted = (x, y) => focussed ? helpers.entryHasCell(focussed, x, y) : false;

        return React.DOM.div({
            className: 'crossword__container'
        },
        React.DOM.div({
            className: 'crossword__grid-wrapper'
        },
        Grid({
            rows: this.rows,
            columns: this.columns,
            cells: this.state.grid,
            setCellValue: this.setCellValue,
            onSelect: this.onSelect,
            isHighlighted: isHighlighted,
            focussedCell: this.state.cellInFocus,
            ref: 'grid'
        }),
        React.DOM.div({
            className: 'crossword__hidden-input-wrapper',
            ref: 'hiddenInputWrapper'
        },
        React.DOM.input({
            type: 'text',
            className: 'crossword__hidden-input',
            ref: 'hiddenInput',
            maxLength: '1',
            onKeyDown: this.onKeyDown,
            value: this.hiddenInputValue(),
            onClick: this.onClickHiddenInput,
            autoComplete: 'off'
        }))),
        Controls({
            hasSolutions: this.hasSolutions(),
            clueInFocus: focussed,
            onCheat: this.onCheat,
            onSolution: this.onSolution,
            onCheck: this.onCheck,
            onCheckAll: this.onCheckAll,
            onClearAll: this.onClearAll
        }),
        FocussedClue({
            clueText: focussed ? focussed.clue : null
        }),
        Clues({
            clues: this.cluesData(),
            focusClue: this.focusClue
        }));
    }
});

export default function () {
    $('.js-crossword').each(function (element) {
        if (element.hasAttribute('data-crossword-data')) {
            var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
            React.renderComponent(new Crossword({data: crosswordData}), element);
        } else {
            throw 'JavaScript crossword without associated data in data-crossword-data';
        }
    });
};

