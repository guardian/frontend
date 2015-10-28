define([
    'react',
    'bonzo',
    'bean',
    'fastdom',
    'classnames',
    'common/utils/$',
    'common/utils/_',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/scroller',
    './anagram-helper/main',
    './clues',
    './controls',
    './hidden-input',
    './grid',
    './helpers',
    './keycodes',
    './persistence'
], function (
    React,
    bonzo,
    bean,
    fastdom,
    classNames,
    $,
    _,
    mediator,
    detect,
    scroller,
    AnagramHelper,
    Clues,
    Controls,
    HiddenInput,
    Grid,
    helpers,
    keycodes,
    persistence
) {
    var Crossword = React.createClass({
        getInitialState: function () {
            var dimensions = this.props.data.dimensions;

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
                grid: helpers.buildGrid(dimensions.rows, dimensions.cols, this.props.data.entries, persistence.loadGridState(this.props.data.id)),
                cellInFocus: null,
                directionOfEntry: null,
                showAnagramHelper: false
            };
        },

        componentDidMount: function () {
            // Sticky clue
            var $stickyClueWrapper = $(React.findDOMNode(this.refs.stickyClueWrapper));
            var $grid = $(React.findDOMNode(this.refs.grid));
            var $game = $(React.findDOMNode(this.refs.game));
            var isIOS = detect.isIOS();

            mediator.on('window:resize', _.debounce(this.setGridHeight.bind(this), 200));
            mediator.on('window:orientationchange', _.debounce(this.setGridHeight.bind(this), 200));
            this.setGridHeight();

            mediator.on('window:throttledScroll', function () {
                var gridOffset = $grid.offset();
                var gameOffset = $game.offset();
                var stickyClueWrapperOffset = $stickyClueWrapper.offset();
                var scrollY = window.scrollY;

                fastdom.write(function () {
                    // Clear previous state
                    $stickyClueWrapper.css('top', '').css('bottom', '').removeClass('is-fixed');

                    var scrollYPastGame = scrollY - gameOffset.top;

                    if (scrollYPastGame >= 0) {
                        var gridOffsetBottom = gridOffset.top + gridOffset.height;

                        if (scrollY > gridOffsetBottom - stickyClueWrapperOffset.height) {
                            $stickyClueWrapper.css('top', 'auto').css('bottom', 0);
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
        },

        componentDidUpdate: function (prevProps, prevState) {
            // return focus to active cell after exiting anagram helper
            if (!this.state.showAnagramHelper && (this.state.showAnagramHelper !== prevState.showAnagramHelper)) {
                this.focusCurrentCell();
            }
        },

        setGridHeight: function () {
            if (!this.$gridWrapper) {
                this.$gridWrapper = $(React.findDOMNode(this.refs.gridWrapper));
            }

            if (detect.isBreakpoint({
                    max: 'tablet'
                })) {
                fastdom.read(function () {
                    // Our grid is a square, set the height of the grid wrapper
                    // to the width of the grid wrapper
                    fastdom.write(function () {
                        this.$gridWrapper.css('height', this.$gridWrapper.offset().width + 'px');
                    }.bind(this));
                    this.gridHeightIsSet = true;
                }.bind(this));
            } else if (this.gridHeightIsSet) {
                // Remove inline style if tablet and wider
                this.$gridWrapper.attr('style', '');
            }
        },

        setCellValue: function (x, y, value) {
            this.setState({
                grid: helpers.mapGrid(this.state.grid, function (cell, gridX, gridY) {
                    if (gridX === x && gridY === y) {
                        cell.value = value;
                        cell.isError = false;
                    }

                    return cell;
                })
            });
        },

        getCellValue: function (x, y) {
            return this.state.grid[x][y].value;
        },

        cellIsEmpty: function (x, y) {
            return !this.getCellValue(x, y);
        },

        insertCharacter: function (character) {
            var cell = this.state.cellInFocus;
            if (/[A-Z]/.test(character) && character.length === 1) {
                this.setCellValue(cell.x, cell.y, character);
                this.save();
                this.focusNext();
            }
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
                if (event.keyCode === keycodes.backspace || event.keyCode === keycodes.delete) {
                    event.preventDefault();
                    if (this.cellIsEmpty(cell.x, cell.y)) {
                        this.focusPrevious();
                    } else {
                        this.setCellValue(cell.x, cell.y, '');
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
        },

        setReturnPosition: function (position) {
            this.returnPosition = position;
        },

        goToReturnPosition: function () {
            if (detect.isBreakpoint({
                    max: 'mobile'
                })) {
                if (this.returnPosition) {
                    scroller.scrollTo(this.returnPosition, 250, 'easeOutQuad');
                }
                this.returnPosition = null;
            }
        },

        indexOfClueInFocus: function () {
            return this.props.data.entries.indexOf(this.clueInFocus());
        },

        focusPreviousClue: function () {
            var i = this.indexOfClueInFocus();
            var entries = this.props.data.entries;

            if (i !== -1) {
                var newClue = entries[i === 0 ? entries.length - 1 : i - 1];
                this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
            }
        },

        focusNextClue: function () {
            var i = this.indexOfClueInFocus();
            var entries = this.props.data.entries;

            if (i !== -1) {
                var newClue = entries[i === entries.length - 1 ? 0 : i + 1];
                this.focusClue(newClue.position.x, newClue.position.y, newClue.direction);
            }
        },

        moveFocus: function (deltaX, deltaY) {
            var cell = this.state.cellInFocus;
            var x = cell.x + deltaX;
            var y = cell.y + deltaY;
            var direction = this;

            if (this.state.grid[x] && this.state.grid[x][y] && this.state.grid[x][y].isEditable) {
                if (deltaY !== 0) {
                    direction = 'down';
                } else if (deltaX !== 0) {
                    direction = 'across';
                }
                this.focusClue(x, y, direction);
            }
        },

        isAcross: function () {
            return this.state.directionOfEntry === 'across';
        },

        focusPrevious: function () {
            var cell = this.state.cellInFocus;
            var clue = this.clueInFocus();

            if (helpers.isFirstCellInClue(cell, clue)) {
                var newClue = helpers.getPreviousClueInGroup(this.props.data.entries, clue);
                if (newClue) {
                    var newCell = helpers.getLastCellInClue(newClue);
                    this.focusClue(newCell.x, newCell.y, newClue.direction);
                }
            } else {
                if (this.isAcross()) {
                    this.moveFocus(-1, 0);
                } else {
                    this.moveFocus(0, -1);
                }
            }
        },

        focusNext: function () {
            var cell = this.state.cellInFocus;
            var clue = this.clueInFocus();

            if (helpers.isLastCellInClue(cell, clue)) {
                var newClue = helpers.getNextClueInGroup(this.props.data.entries, clue);
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
        },

        asPercentage: function (x, y) {
            var width = helpers.gridSize(this.columns);
            var height = helpers.gridSize(this.rows);

            return {
                x: 100 * x / width,
                y: 100 * y / height
            };
        },

        focusHiddenInput: function (x, y) {
            var wrapper = React.findDOMNode(this.refs.hiddenInputComponent.refs.wrapper);
            var left = helpers.gridSize(x);
            var top = helpers.gridSize(y);
            var position = this.asPercentage(left, top);

            /** This has to be done before focus to move viewport accordingly */
            wrapper.style.left = position.x + '%';
            wrapper.style.top = position.y + '%';

            var hiddenInputNode = React.findDOMNode(this.refs.hiddenInputComponent.refs.input);

            if (document.activeElement !== hiddenInputNode) {
                hiddenInputNode.focus();
            }
        },

        // called when cell is selected (by click or programtically focussed)
        onSelect: function (x, y) {
            var cellInFocus = this.state.cellInFocus;
            var clue = helpers.cluesFor(this.clueMap, x, y);
            var focussedClue = this.clueInFocus();
            var newDirection;

            var isInsideFocussedClue = function isInsideFocussedClue() {
                return focussedClue ? helpers.entryHasCell(focussedClue, x, y) : false;
            };

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
                this.state.cellInFocus = {
                    x: x,
                    y: y
                };

                var isStartOfClue = function isStartOfClue(sourceClue) {
                    return sourceClue && sourceClue.position.x === x && sourceClue.position.y === y;
                };

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

        // Focus corresponding clue for a given cell
        focusClue: function (x, y, direction) {
            var clues = helpers.cluesFor(this.clueMap, x, y);
            var clue = clues[direction];

            if (clues && clue) {
                this.focusHiddenInput(x, y);

                this.setState({
                    cellInFocus: {
                        x: x,
                        y: y
                    },
                    directionOfEntry: direction
                });

                // Side effect
                history.replaceState(undefined, undefined, '#' + clue.id);
            }
        },

        // Focus first cell in given clue
        focusFirstCellInClue: function (entry) {
            this.focusClue(entry.position.x, entry.position.y, entry.direction);
        },

        focusCurrentCell: function () {
            this.focusHiddenInput(this.state.cellInFocus.x, this.state.cellInFocus.y);
        },

        clueInFocus: function () {
            if (this.state.cellInFocus) {
                var cluesForCell = helpers.cluesFor(this.clueMap, this.state.cellInFocus.x, this.state.cellInFocus.y);
                return cluesForCell[this.state.directionOfEntry];
            } else {
                return null;
            }
        },

        allHighlightedClues: function () {
            return _.filter(this.props.data.entries, this.clueIsInFocusGroup, this);
        },

        clueIsInFocusGroup: function (clue) {
            if (this.state.cellInFocus) {
                var cluesForCell = helpers.cluesFor(this.clueMap, this.state.cellInFocus.x, this.state.cellInFocus.y);
                return _.contains(cluesForCell[this.state.directionOfEntry].group, clue.id);
            } else {
                return null;
            }
        },

        cluesData: function () {
            return _.map(this.props.data.entries, function (entry) {
                return {
                    entry: entry,
                    hasAnswered: helpers.checkClueHasBeenAnswered(this.state.grid, entry),
                    isSelected: this.clueIsInFocusGroup(entry)
                };
            }.bind(this));
        },

        save: function () {
            persistence.saveGridState(this.props.data.id, this.state.grid);
        },

        cheat: function (entry) {
            var cells = helpers.cellsForEntry(entry);

            if (entry.solution) {
                this.setState({
                    grid: helpers.mapGrid(this.state.grid, function (cell, x, y) {
                        if (_.some(cells, function (c) {
                                return c.x === x && c.y === y;
                            })) {
                            var n = entry.direction === 'across' ? x - entry.position.x : y - entry.position.y;

                            cell.value = entry.solution[n];
                        }

                        return cell;
                    })
                });
            }
        },

        check: function (entry) {
            var cells = helpers.cellsForEntry(entry);

            if (entry.solution) {
                var badCells = _.map(_.filter(_.zip(cells, entry.solution), function (cellAndSolution) {
                    var coords = cellAndSolution[0];
                    var cell = this.state.grid[coords.x][coords.y];
                    var solution = cellAndSolution[1];
                    return (/^[A-Z]$/.test(cell.value) && cell.value !== solution);
                }.bind(this)), function (cellAndSolution) {
                    return cellAndSolution[0];
                });

                this.setState({
                    grid: helpers.mapGrid(this.state.grid, function (cell, gridX, gridY) {
                        if (_.some(badCells, function (bad) {
                                return bad.x === gridX && bad.y === gridY;
                            })) {
                            cell.isError = true;
                            cell.value = '';
                        }

                        return cell;
                    })
                });

                setTimeout(function () {
                    this.setState({
                        grid: helpers.mapGrid(this.state.grid, function (cell, gridX, gridY) {
                            if (_.some(badCells, function (bad) {
                                    return bad.x === gridX && bad.y === gridY;
                                })) {
                                cell.isError = false;
                                cell.value = '';
                            }

                            return cell;
                        })
                    });
                }.bind(this), 150);
            }
        },

        onCheat: function () {
            _.forEach(this.allHighlightedClues(), this.cheat, this);
            this.save();
        },

        onCheck: function () {
            // 'Check this' checks single and grouped clues
            _.forEach(this.allHighlightedClues(), this.check, this);
            this.save();
        },

        onSolution: function () {
            _.forEach(this.props.data.entries, this.cheat, this);
            this.save();
        },

        onCheckAll: function () {
            _.forEach(this.props.data.entries, this.check, this);
            this.save();
        },

        onClearAll: function () {
            this.setState({
                grid: helpers.mapGrid(this.state.grid, function (cell) {
                    cell.value = '';
                    return cell;
                })
            });

            this.save();
        },

        onClearSingle: function () {
            // Merge arrays of cells from all highlighted clues
            //const cellsInFocus = _.flatten(_.map(this.allHighlightedClues(), helpers.cellsForEntry, this));
            var cellsInFocus = helpers.getClearableCellsForClue(this.state.grid, this.clueMap, this.props.data.entries, this.clueInFocus());

            this.setState({
                grid: helpers.mapGrid(this.state.grid, function (cell, gridX, gridY) {
                    if (_.some(cellsInFocus, function (c) {
                            return c.x === gridX && c.y === gridY;
                        })) {
                        cell.value = '';
                    }
                    return cell;
                })
            });

            this.save();
        },

        onToggleAnagramHelper: function () {
            // only show anagram helper if a clue is active
            if (!this.state.showAnagramHelper) {
                return this.clueInFocus() && this.setState({
                    showAnagramHelper: true
                });
            }

            this.setState({
                showAnagramHelper: false
            });
        },

        hiddenInputValue: function () {
            var cell = this.state.cellInFocus;

            var currentValue;

            if (cell) {
                currentValue = this.state.grid[cell.x][cell.y].value;
            }

            return currentValue ? currentValue : '';
        },

        onClickHiddenInput: function (event) {
            var focussed = this.state.cellInFocus;

            this.onSelect(focussed.x, focussed.y);

            /* We need to handle touch seperately as touching an input on iPhone does not fire the
            click event - listen for a touchStart and preventDefault to avoid calling onSelect twice on
            devices that fire click AND touch events. The click event doesn't fire only when the input is already focused */
            if (event.type === 'touchstart') {
                event.preventDefault();
            }
        },

        hasSolutions: function () {
            return 'solution' in this.props.data.entries[0];
        },

        render: function () {
            var focussed = this.clueInFocus();
            var isHighlighted = function isHighlighted(x, y) {
                return focussed ? focussed.group.some(function (id) {
                    var entry = _.find(this.props.data.entries, {
                        id: id
                    });
                    return helpers.entryHasCell(entry, x, y);
                }.bind(this)) : false;
            }.bind(this);

            var anagramHelper = this.state.showAnagramHelper && React.createElement(AnagramHelper, {
                focussedEntry: focussed,
                entries: this.props.data.entries,
                grid: this.state.grid,
                close: this.onToggleAnagramHelper
            });

            return React.createElement(
                'div', {
                    className: 'crossword__container crossword__container--' + this.props.data.crosswordType + ' crossword__container--react'
                },
                React.createElement(
                    'div', {
                        className: 'crossword__container__game',
                        ref: 'game'
                    },
                    React.createElement(
                        'div', {
                            className: 'crossword__sticky-clue-wrapper',
                            ref: 'stickyClueWrapper'
                        },
                        React.createElement(
                            'div', {
                                className: classNames({
                                    'crossword__sticky-clue': true,
                                    'is-hidden': !focussed
                                }),
                                ref: 'stickyClue'
                            },
                            focussed && React.createElement(
                                'div', {
                                    className: 'crossword__sticky-clue__inner'
                                },
                                React.createElement(
                                    'div', {
                                        className: 'crossword__sticky-clue__inner__inner'
                                    },
                                    React.createElement(
                                        'strong',
                                        null,
                                        focussed.number,
                                        ' ',
                                        React.createElement(
                                            'span', {
                                                className: 'crossword__sticky-clue__direction'
                                            },
                                            focussed.direction
                                        )
                                    ),
                                    ' ',
                                    focussed.clue
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div', {
                            className: 'crossword__container__grid-wrapper',
                            ref: 'gridWrapper'
                        },
                        React.createElement(Grid, {
                            rows: this.rows,
                            columns: this.columns,
                            cells: this.state.grid,
                            separators: helpers.buildSeparatorMap(this.props.data.entries),
                            setCellValue: this.setCellValue,
                            onSelect: this.onSelect,
                            isHighlighted: isHighlighted,
                            focussedCell: this.state.cellInFocus,
                            ref: 'grid'
                        }),
                        React.createElement(HiddenInput, {
                            onChange: this.insertCharacter,
                            onClick: this.onClickHiddenInput,
                            touchStart: this.onClickHiddenInput,
                            onKeyDown: this.onKeyDown,
                            onBlur: this.goToReturnPosition,
                            value: this.hiddenInputValue(),
                            ref: 'hiddenInputComponent'
                        }),
                        anagramHelper
                    )
                ),
                React.createElement(Controls, {
                    hasSolutions: this.hasSolutions(),
                    clueInFocus: focussed,
                    onCheat: this.onCheat,
                    onSolution: this.onSolution,
                    onCheck: this.onCheck,
                    onCheckAll: this.onCheckAll,
                    onClearAll: this.onClearAll,
                    onClearSingle: this.onClearSingle,
                    onToggleAnagramHelper: this.onToggleAnagramHelper
                }),
                React.createElement(Clues, {
                    clues: this.cluesData(),
                    focussed: focussed,
                    focusClue: this.focusClue,
                    setReturnPosition: this.setReturnPosition
                })
            );
        }
    });

    return function () {
        $('.js-crossword').each(function (element) {
            if (element.hasAttribute('data-crossword-data')) {
                (function () {
                    var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
                    var crosswordComponent = React.render(React.createElement(Crossword, {
                        data: crosswordData
                    }), element);

                    var entryId = window.location.hash.replace('#', '');
                    var entry = _.find(crosswordComponent.props.data.entries, {
                        id: entryId
                    });
                    if (entry) {
                        crosswordComponent.focusFirstCellInClue(entry);
                    }

                    bean.on(element, 'click', $('.crossword__clue'), function (e) {
                        var idMatch = e.currentTarget.hash.match(/#.*/);
                        var newEntryId = idMatch && idMatch[0].replace('#', '');

                        var newEntry = _.find(crosswordComponent.props.data.entries, {
                            id: newEntryId
                        });
                        var focussedEntry = crosswordComponent.clueInFocus();
                        var isNewEntry = focussedEntry && focussedEntry.id !== newEntry.id;
                        // Only focus the first cell in the new clue if it's not already
                        // focussed. When focussing a cell in a new clue, we update the
                        // hash fragment afterwards, in which case we do not want to
                        // reset focus to the first cell.
                        if (newEntry && (focussedEntry ? isNewEntry : true)) {
                            crosswordComponent.focusFirstCellInClue(newEntry);
                        }

                        e.preventDefault();
                    });
                })();
            } else {
                throw 'JavaScript crossword without associated data in data-crossword-data';
            }
        });

        $('.js-print-crossword').each(function (element) {
            bean.on(element, 'click', window.print.bind(window));
            bonzo(element).removeClass('js-print-crossword');
        });
    };
});
