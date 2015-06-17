/* eslint new-cap: 0 */

import React from 'react';

import $ from 'common/utils/$';
import _ from 'common/utils/_';
import detect from 'common/utils/detect';
import scroller from 'common/utils/scroller';

import Clues from './clues';
import Controls from './controls';
import HiddenInput from './hidden-input';
import Grid from './grid';
import helpers from './helpers';
import keycodes from './keycodes';
import persistence from './persistence';
import loadFont from './font';

class Crossword extends React.Component {

    constructor (props) {
        super(props);

        const dimensions = this.props.data.dimensions;

        this.columns = dimensions.cols;
        this.rows = dimensions.rows;
        this.clueMap = helpers.buildClueMap(this.props.data.entries);

        _.bindAll(this,
            'onCheat',
            'onSolution',
            'onCheck',
            'onCheckAll',
            'onClearAll',
            'onSelect',
            'onKeyDown',
            'onClickHiddenInput',
            'focusClue',
            'insertCharacter',
            'setReturnPosition',
            'goToReturnPosition'
        );

        loadFont();

        this.state = {
            grid: helpers.buildGrid(
                dimensions.rows,
                dimensions.cols,
                this.props.data.entries,
                persistence.loadGridState(this.props.data.id)
            ),
            cellInFocus: null,
            directionOfEntry: null
        };
    }

    componentDidMount () {
        // focus the first clue if we're above mobile
        if (detect.isBreakpoint({ min: 'tablet' })) {
            const firstClue = _.reduceRight(_.sortBy(this.props.data.entries, 'direction'), function(prev, current) {
                return (helpers.isAcross(current) && (prev.number < current.number ? prev : current));
            });
            this.focusClue(
                firstClue.position.x,
                firstClue.position.y,
                firstClue.direction
            );
        }
    }

    setCellValue (x, y, value) {
        const cell = this.state.grid[x][y];

        cell.value = value;
        cell.isError = false;
        this.forceUpdate();
    }

    getCellValue (x, y) {
        return this.state.grid[x][y].value;
    }

    cellIsEmpty (x, y) {
        return !this.getCellValue(x, y);
    }

    insertCharacter (character) {
        const cell = this.state.cellInFocus;
        if (/[A-Z]/.test(character)) {
            this.setCellValue(cell.x, cell.y, character);
            this.save();
            this.focusNext();
        }
    }

    onKeyDown (event) {
        const cell = this.state.cellInFocus;

        if (event.keyCode === keycodes.tab) {
            event.preventDefault();
            if (event.shiftKey) {
                this.focusPreviousClue();
            } else {
                this.focusNextClue();
            }
        } else if (!event.metaKey && !event.ctrlKey && !event.altKey) {
            if (event.keyCode === keycodes.backspace) {
                event.preventDefault();
                if (this.cellIsEmpty(cell.x, cell.y)) {
                    this.focusPrevious();
                } else {
                    this.setCellValue(cell.x, cell.y, null);
                    this.save();
                }
            } else if (event.keyCode === keycodes.left) {
                event.preventDefault();
                this.moveFocus(-1, 0);
            } else if (event.keyCode === keycodes.up) {
                event.preventDefault();
                this.moveFocus(0, -1);
            } else if (event.keyCode === keycodes.right) {
                event.preventDefault();
                this.moveFocus(1, 0);
            } else if (event.keyCode === keycodes.down) {
                event.preventDefault();
                this.moveFocus(0, 1);
            }
        }
    }

    setReturnPosition (position) {
        this.returnPosition = position;
    }

    goToReturnPosition () {
        if (detect.isBreakpoint({ max: 'mobile' })) {
            if (this.returnPosition) {
                scroller.scrollTo(this.returnPosition, 250, 'easeOutQuad');
            }
            this.returnPosition = null;
        }
    }

    indexOfClueInFocus () {
        return this.props.data.entries.indexOf(this.clueInFocus());
    }

    focusPreviousClue () {
        const i = this.indexOfClueInFocus();
        const entries = this.props.data.entries;

        if (i !== -1) {
            const newClue = entries[(i === 0) ? entries.length - 1 : i - 1];
            this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
        }
    }

    focusNextClue () {
        const i = this.indexOfClueInFocus();
        const entries = this.props.data.entries;

        if (i !== -1) {
            const newClue = entries[(i === entries.length - 1) ? 0 : i + 1];
            this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
        }
    }

    moveFocus (deltaX, deltaY) {
        const cell = this.state.cellInFocus;
        const x = cell.x + deltaX;
        const y = cell.y + deltaY;
        let direction;

        if (this.state.grid[x] && this.state.grid[x][y] && this.state.grid[x][y].isEditable) {
            if (deltaY !== 0) {
                direction = 'down';
            } else if (deltaX !== 0) {
                direction = 'across';
            }
            this.focusClue(x, y, direction);
        }
    }

    isAcross () {
        return this.state.directionOfEntry === 'across';
    }

    focusPrevious () {
        if (this.isAcross()) {
            this.moveFocus(-1, 0);
        } else {
            this.moveFocus(0, -1);
        }
    }

    focusNext () {
        if (this.isAcross()) {
            this.moveFocus(1, 0);
        } else {
            this.moveFocus(0, 1);
        }
    }

    asPercentage (x, y) {
        const width = helpers.gridSize(this.columns);
        const height = helpers.gridSize(this.rows);

        return {
            x: 100 * x / width,
            y: 100 * y / height
        };
    }

    focusHiddenInput (x, y) {
        const wrapper = this.refs.hiddenInputComponent.refs.wrapper.getDOMNode();
        const left = helpers.gridSize(x);
        const top = helpers.gridSize(y);
        const position = this.asPercentage(left, top);

        /** This has to be done before focus to move viewport accordingly */
        wrapper.style.left = position.x + '%';
        wrapper.style.top = position.y + '%';

        const hiddenInputNode = this.refs.hiddenInputComponent.refs.input.getDOMNode();

        if (document.activeElement !== hiddenInputNode) {
            hiddenInputNode.focus();
        }
    }

    // called when cell is selected (by click or programtically focussed)
    onSelect (x, y) {
        const cellInFocus = this.state.cellInFocus;
        const clue = this.cluesFor(x, y);
        const focussedClue = this.clueInFocus();

        let newDirection;

        const isInsideFocussedClue = () => focussedClue ? helpers.entryHasCell(focussedClue, x, y) : false;

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

            this.focusClue(x, y, this.state.directionOfEntry);
        } else {
            this.state.cellInFocus = {x: x, y: y};

            const isStartOfClue = (sourceClue) => sourceClue && sourceClue.position.x === x && sourceClue.position.y === y;

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
    }

    focusClue (x, y, direction) {
        const clues = this.cluesFor(x, y);

        if (clues && clues[direction]) {
            this.focusHiddenInput(x, y);
            this.state.cellInFocus = {x: x, y: y};
            this.state.directionOfEntry = direction;
            this.forceUpdate();
        }
    }

    cluesFor (x, y) {
        return this.clueMap[helpers.clueMapKey(x, y)];
    }

    clueInFocus () {
        if (this.state.cellInFocus) {
            const cluesForCell = this.cluesFor(this.state.cellInFocus.x, this.state.cellInFocus.y);
            return cluesForCell[this.state.directionOfEntry];
        } else {
            return null;
        }
    }

    cluesData () {
        return _.map(this.props.data.entries, (entry) => ({
            entry: entry,
            hasAnswered: _.every(helpers.cellsForEntry(entry), (position) => {
                return /^[A-Z]$/.test(this.state.grid[position.x][position.y].value);
            }),
            isSelected: this.clueInFocus() === entry
        }));
    }

    save () {
        persistence.saveGridState(this.props.data.id, this.state.grid);
    }

    cheat (entry) {
        const cells = helpers.cellsForEntry(entry);

        if (entry.solution) {
            _.forEach(cells, (cell, n) => {
                this.state.grid[cell.x][cell.y].value = entry.solution[n];
            });

            this.forceUpdate();
        }
    }

    check (entry) {
        const cells = _.map(helpers.cellsForEntry(entry), (cell) => this.state.grid[cell.x][cell.y]);

        if (entry.solution) {
            const badCells = _.map(_.filter(_.zip(cells, entry.solution), (cellAndSolution) => {
                const cell = cellAndSolution[0];
                const solution = cellAndSolution[1];
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
            }, 150);
        }
    }

    onCheat () {
        this.cheat(this.clueInFocus());
        this.save();
    }

    onCheck () {
        this.check(this.clueInFocus());
        this.save();
    }

    onSolution () {
        _.forEach(this.props.data.entries, (entry) => {
            this.cheat(entry);
        });
        this.save();
    }

    onCheckAll () {
        _.forEach(this.props.data.entries, (entry) => {
            this.check(entry);
        });
        this.save();
    }

    onClearAll () {
        _.forEach(this.state.grid, function (row) {
            _.forEach(row, function (cell) {
                cell.value = '';
            });
        });
        this.forceUpdate();
        this.save();
    }

    hiddenInputValue () {
        const cell = this.state.cellInFocus;

        let currentValue;

        if (cell) {
            currentValue = this.state.grid[cell.x][cell.y].value;
        }

        return currentValue ? currentValue : '';
    }

    onClickHiddenInput () {
        const focussed = this.state.cellInFocus;

        this.onSelect(focussed.x, focussed.y);
    }

    hasSolutions () {
        return 'solution' in this.props.data.entries[0];
    }

    render () {
        const focussed = this.clueInFocus();
        const isHighlighted = (x, y) => focussed ? helpers.entryHasCell(focussed, x, y) : false;

        return (
            <div className={`crossword__container crossword__container--${this.props.data.crosswordType}`}>
                <div className='crossword__grid-wrapper'>
                    <Grid
                        rows={this.rows}
                        columns={this.columns}
                        cells={this.state.grid}
                        setCellValue={this.setCellValue}
                        onSelect={this.onSelect}
                        isHighlighted={isHighlighted}
                        focussedCell={this.state.cellInFocus}
                        ref='grid'
                    />
                    <HiddenInput
                        onChange={this.insertCharacter}
                        onClick={this.onClickHiddenInput}
                        onKeyDown={this.onKeyDown}
                        onBlur={this.goToReturnPosition}
                        value={this.hiddenInputValue()}
                        ref='hiddenInputComponent'
                    />
                </div>
                <Controls
                    hasSolutions={this.hasSolutions()}
                    clueInFocus={focussed}
                    onCheat={this.onCheat}
                    onSolution={this.onSolution}
                    onCheck={this.onCheck}
                    onCheckAll={this.onCheckAll}
                    onClearAll={this.onClearAll}
                />
                <Clues
                    clues={this.cluesData()}
                    focusClue={this.focusClue}
                    setReturnPosition={this.setReturnPosition}
                />
            </div>
        );
    }
}

export default function () {
    $('.js-crossword').each(function (element) {
        if (element.hasAttribute('data-crossword-data')) {
            const crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
            React.render(<Crossword data={crosswordData} />, element);
        } else {
            throw 'JavaScript crossword without associated data in data-crossword-data';
        }
    });
}

