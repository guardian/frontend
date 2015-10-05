/* eslint new-cap: 0 */

import React from 'react';
import bonzo from 'bonzo';
import bean from 'bean';
import fastdom from 'fastdom';
import classNames from 'classnames';

import $ from 'common/utils/$';
import _ from 'common/utils/_';
import mediator from 'common/utils/mediator';
import detect from 'common/utils/detect';
import scroller from 'common/utils/scroller';

import AnagramHelper from './anagram-helper/main';
import Clues from './clues';
import Controls from './controls';
import HiddenInput from './hidden-input';
import Grid from './grid';
import helpers from './helpers';
import keycodes from './keycodes';
import persistence from './persistence';

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
            'onClearSingle',
            'onToggleAnagramHelper',
            'onSelect',
            'onKeyDown',
            'onClickHiddenInput',
            'focusClue',
            'insertCharacter',
            'setReturnPosition',
            'goToReturnPosition'
        );


        this.state = {
            grid: helpers.buildGrid(
                dimensions.rows,
                dimensions.cols,
                this.props.data.entries,
                persistence.loadGridState(this.props.data.id)
            ),
            cellInFocus: null,
            directionOfEntry: null,
            showAnagramHelper: false
        };
    }

    componentDidMount () {
        // Sticky clue
        const $stickyClueWrapper = $(React.findDOMNode(this.refs.stickyClueWrapper));
        const $grid = $(React.findDOMNode(this.refs.grid));
        const $game = $(React.findDOMNode(this.refs.game));
        const isIOS = detect.isIOS();

        mediator.on('window:throttledScroll', () => {
            const gridOffset = $grid.offset();
            const gameOffset = $game.offset();
            const stickyClueWrapperOffset = $stickyClueWrapper.offset();
            const { scrollY } = window;

            fastdom.write(() => {
                // Clear previous state
                $stickyClueWrapper
                    .css('top', '')
                    .css('bottom', '')
                    .removeClass('is-fixed');

                const scrollYPastGame = scrollY - gameOffset.top;

                if (scrollYPastGame >= 0) {
                    const gridOffsetBottom = gridOffset.top + gridOffset.height;

                    if (scrollY > (gridOffsetBottom - stickyClueWrapperOffset.height)) {
                        $stickyClueWrapper
                            .css('top', 'auto')
                            .css('bottom', 0);
                    } else {
                        // iOS doesn't support sticky things when the keyboard
                        // is open, so we use absolute positioning and
                        // programatically update the value of top
                        if (isIOS) {
                            $stickyClueWrapper.css('top', scrollYPastGame);
                        } else {
                            $stickyClueWrapper.addClass('is-fixed');
                        }
                    }
                }
            });
        });
    }

    componentDidUpdate (prevProps, prevState) {
        // return focus to active cell after exiting anagram helper
        if (!this.state.showAnagramHelper && (this.state.showAnagramHelper !== prevState.showAnagramHelper)) {
            this.focusCurrentCell();
        }
    }

    setCellValue (x, y, value) {
        this.setState({
            grid: helpers.mapGrid(this.state.grid, (cell, gridX, gridY) => {
                if (gridX === x && gridY === y) {
                    cell.value = value;
                    cell.isError = false;
                }

                return cell;
            })
        });
    }

    getCellValue (x, y) {
        return this.state.grid[x][y].value;
    }

    cellIsEmpty (x, y) {
        return !this.getCellValue(x, y);
    }

    insertCharacter (character) {
        const cell = this.state.cellInFocus;
        if (/[A-Z]/.test(character) && character.length === 1) {
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
        const cell = this.state.cellInFocus;
        const clue = this.clueInFocus();

        if (helpers.isFirstCellInClue(cell, clue)) {
            const newClue = helpers.getPreviousClueInGroup(this.props.data.entries, clue);
            if (newClue) {
                const newCell = helpers.getLastCellInClue(newClue);
                this.focusClue(newCell.x, newCell.y, newClue.direction);
            }
        } else {
            if (this.isAcross()) {
                this.moveFocus(-1, 0);
            } else {
                this.moveFocus(0, -1);
            }
        }
    }

    focusNext () {
        const cell = this.state.cellInFocus;
        const clue = this.clueInFocus();

        if (helpers.isLastCellInClue(cell, clue)) {
            const newClue = helpers.getNextClueInGroup(this.props.data.entries, clue);
            if (newClue) {
                this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
            }
        } else {
            if (this.isAcross()) {
                this.moveFocus(1, 0);
            } else {
                this.moveFocus(0, 1);
            }
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
        const wrapper = React.findDOMNode(this.refs.hiddenInputComponent.refs.wrapper);
        const left = helpers.gridSize(x);
        const top = helpers.gridSize(y);
        const position = this.asPercentage(left, top);

        /** This has to be done before focus to move viewport accordingly */
        wrapper.style.left = position.x + '%';
        wrapper.style.top = position.y + '%';

        const hiddenInputNode = React.findDOMNode(this.refs.hiddenInputComponent.refs.input);

        if (document.activeElement !== hiddenInputNode) {
            hiddenInputNode.focus();
        }
    }

    // called when cell is selected (by click or programtically focussed)
    onSelect (x, y) {
        const cellInFocus = this.state.cellInFocus;
        const clue = helpers.cluesFor(this.clueMap, x, y);
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

    // Focus corresponding clue for a given cell
    focusClue (x, y, direction) {
        const clues = helpers.cluesFor(this.clueMap, x, y);
        const clue = clues[direction];

        if (clues && clue) {
            this.focusHiddenInput(x, y);

            this.setState({
                cellInFocus: { x: x, y: y },
                directionOfEntry: direction
            });

            // Side effect
            window.location.hash = clue.id;
        }
    }

    // Focus first cell in given clue
    focusFirstCellInClue(entry) {
        this.focusClue(entry.position.x, entry.position.y, entry.direction);
    }

    focusCurrentCell () {
        this.focusHiddenInput(this.state.cellInFocus.x, this.state.cellInFocus.y);
    }

    clueInFocus () {
        if (this.state.cellInFocus) {
            const cluesForCell = helpers.cluesFor(this.clueMap, this.state.cellInFocus.x, this.state.cellInFocus.y);
            return cluesForCell[this.state.directionOfEntry];
        } else {
            return null;
        }
    }

    allHighlightedClues () {
        return _.filter(this.props.data.entries, this.clueIsInFocusGroup, this);
    }

    clueIsInFocusGroup (clue) {
        if (this.state.cellInFocus) {
            const cluesForCell = helpers.cluesFor(this.clueMap, this.state.cellInFocus.x, this.state.cellInFocus.y);
            return _.contains(cluesForCell[this.state.directionOfEntry].group, clue.id);
        } else {
            return null;
        }
    }

    cluesData () {
        return _.map(this.props.data.entries, (entry) => ({
            entry: entry,
            hasAnswered: helpers.checkClueHasBeenAnswered(this.state.grid, entry),
            isSelected: this.clueIsInFocusGroup(entry)
        }));
    }

    save () {
        persistence.saveGridState(this.props.data.id, this.state.grid);
    }

    cheat (entry) {
        const cells = helpers.cellsForEntry(entry);

        if (entry.solution) {
            this.setState({
                grid: helpers.mapGrid(this.state.grid, (cell, x, y) => {
                    if (_.some(cells, c => c.x === x && c.y === y)) {
                        const n = entry.direction === 'across' ?
                            x - entry.position.x :
                            y - entry.position.y;

                        cell.value = entry.solution[n];
                    }

                    return cell;
                })
            });
        }
    }

    check (entry) {
        const cells = helpers.cellsForEntry(entry);

        if (entry.solution) {
            const badCells = _.map(_.filter(_.zip(cells, entry.solution), (cellAndSolution) => {
                const coords = cellAndSolution[0];
                const cell = this.state.grid[coords.x][coords.y];
                const solution = cellAndSolution[1];
                return /^[A-Z]$/.test(cell.value) && cell.value !== solution;
            }), cellAndSolution => {
                return cellAndSolution[0];
            });

            this.setState({
                grid: helpers.mapGrid(this.state.grid, (cell, gridX, gridY) => {
                    if (_.some(badCells, bad => bad.x === gridX && bad.y === gridY)) {
                        cell.isError = true;
                        cell.value = '';
                    }

                    return cell;
                })
            });

            setTimeout(() => {
                this.setState({
                    grid: helpers.mapGrid(this.state.grid, (cell, gridX, gridY) => {
                        if (_.some(badCells, bad => bad.x === gridX && bad.y === gridY)) {
                            cell.isError = false;
                            cell.value = '';
                        }

                        return cell;
                    })
                });
            }, 150);
        }
    }

    onCheat () {
        _.forEach(this.allHighlightedClues(), this.cheat, this);
        this.save();
    }

    onCheck () {
        // 'Check this' checks single and grouped clues
        _.forEach(this.allHighlightedClues(), this.check, this);
        this.save();
    }

    onSolution () {
        _.forEach(this.props.data.entries, this.cheat, this);
        this.save();
    }

    onCheckAll () {
        _.forEach(this.props.data.entries, this.check, this);
        this.save();
    }

    onClearAll () {
        this.setState({
            grid: helpers.mapGrid(this.state.grid, cell => {
                cell.value = '';
                return cell;
            })
        });

        this.save();
    }

    onClearSingle () {
        // Merge arrays of cells from all highlighted clues
        //const cellsInFocus = _.flatten(_.map(this.allHighlightedClues(), helpers.cellsForEntry, this));
        const cellsInFocus = helpers.getClearableCellsForClue(this.state.grid, this.clueMap, this.props.data.entries, this.clueInFocus());

        this.setState({
            grid: helpers.mapGrid(this.state.grid, (cell, gridX, gridY) => {
                if (_.some(cellsInFocus, c => c.x === gridX && c.y === gridY)) {
                    cell.value = '';
                }
                return cell;
            })
        });

        this.save();
    }

    onToggleAnagramHelper () {
        // only show anagram helper if a clue is active
        if (!this.state.showAnagramHelper) {
            return this.clueInFocus() && this.setState({
                showAnagramHelper: true
            });
        }

        this.setState({
            showAnagramHelper: false
        });
    }

    hiddenInputValue () {
        const cell = this.state.cellInFocus;

        let currentValue;

        if (cell) {
            currentValue = this.state.grid[cell.x][cell.y].value;
        }

        return currentValue ? currentValue : '';
    }

    onClickHiddenInput (event) {
        const focussed = this.state.cellInFocus;

        this.onSelect(focussed.x, focussed.y);

        /* We need to handle touch seperately as touching an input on iPhone does not fire the
        click event - listen for a touchStart and preventDefault to avoid calling onSelect twice on
        devices that fire click AND touch events. The click event doesn't fire only when the input is already focused */
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
    }

    hasSolutions () {
        return 'solution' in this.props.data.entries[0];
    }

    render () {
        const focussed = this.clueInFocus();
        const isHighlighted = (x, y) => focussed
            ? focussed.group.some(id => {
                const entry = _.find(this.props.data.entries, { id });
                return helpers.entryHasCell(entry, x, y);
            })
            : false;

        const anagramHelper = this.state.showAnagramHelper && (
            <AnagramHelper focussedEntry={focussed} entries={this.props.data.entries} grid={this.state.grid} close={this.onToggleAnagramHelper}/>
        );

        return (
            <div className={`crossword__container crossword__container--${this.props.data.crosswordType}`}>
                <div className='crossword__container__game' ref='game'>
                    <div className='crossword__sticky-clue-wrapper' ref='stickyClueWrapper'>
                        <div
                            className={classNames({
                                'crossword__sticky-clue': true,
                                'is-hidden': !focussed
                            })}
                            ref='stickyClue'>
                            {focussed && (
                                <div className='crossword__sticky-clue__inner'>
                                    <div className='crossword__sticky-clue__inner__inner'>
                                        <strong>{focussed.number} <span className='crossword__sticky-clue__direction'>{focussed.direction}</span></strong> {focussed.clue}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='crossword__container__grid-wrapper'>
                        <Grid
                            rows={this.rows}
                            columns={this.columns}
                            cells={this.state.grid}
                            separators={helpers.buildSeparatorMap(this.props.data.entries)}
                            setCellValue={this.setCellValue}
                            onSelect={this.onSelect}
                            isHighlighted={isHighlighted}
                            focussedCell={this.state.cellInFocus}
                            ref='grid'
                        />
                        <HiddenInput
                            onChange={this.insertCharacter}
                            onClick={this.onClickHiddenInput}
                            touchStart={this.onClickHiddenInput}
                            onKeyDown={this.onKeyDown}
                            onBlur={this.goToReturnPosition}
                            value={this.hiddenInputValue()}
                            ref='hiddenInputComponent'
                        />

                        {anagramHelper}
                    </div>
                </div>

                <Controls
                    hasSolutions={this.hasSolutions()}
                    clueInFocus={focussed}
                    onCheat={this.onCheat}
                    onSolution={this.onSolution}
                    onCheck={this.onCheck}
                    onCheckAll={this.onCheckAll}
                    onClearAll={this.onClearAll}
                    onClearSingle={this.onClearSingle}
                    onToggleAnagramHelper={this.onToggleAnagramHelper}
                />
                <Clues
                    clues={this.cluesData()}
                    focussed={focussed}
                    focusClue={this.focusClue}
                    setReturnPosition={this.setReturnPosition}
                />
            </div>
        );
    }
}

export default function () {
    $('.js-crossword').each(element => {
        if (element.hasAttribute('data-crossword-data')) {
            const crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
            const crosswordComponent = React.render(<Crossword data={crosswordData} />, element);

            const entryId = window.location.hash.replace('#', '');
            const entry = _.find(crosswordComponent.props.data.entries, { id: entryId });
            if (entry) {
                crosswordComponent.focusFirstCellInClue(entry);
            }

            window.addEventListener('hashchange', hashEvent => {
                const idMatch = hashEvent.newURL.match(/#.*/);
                const newEntryId = idMatch && idMatch[0].replace('#', '');

                const newEntry = _.find(crosswordComponent.props.data.entries, { id: newEntryId });
                const focussedEntry = crosswordComponent.clueInFocus();
                const isNewEntry = focussedEntry && focussedEntry.id !== newEntry.id;
                // Only focus the first cell in the new clue if it's not already
                // focussed. When focussing a cell in a new clue, we update the
                // hash fragment afterwards, in which case we do not want to
                // reset focus to the first cell.
                if (newEntry && (focussedEntry ? isNewEntry : true)) {
                    crosswordComponent.focusFirstCellInClue(newEntry);
                }
            });
        } else {
            throw 'JavaScript crossword without associated data in data-crossword-data';
        }
    });

    $('.js-print-crossword').each(element => {
        bean.on(element, 'click', window.print.bind(window));
        bonzo(element).removeClass('js-print-crossword');
    });
}
