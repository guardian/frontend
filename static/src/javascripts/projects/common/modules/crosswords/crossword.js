import React, { Component, findDOMNode, useEffect } from 'preact/compat';
import fastdom from 'fastdom';
import $ from 'lib/$';
import { mediator } from 'lib/mediator';
import { isIOS, isBreakpoint } from 'lib/detect';
import { scrollTo } from 'lib/scroller';
import { AnagramHelper } from 'common/modules/crosswords/anagram-helper/main';
import debounce from 'lodash/debounce';
import zip from 'lodash/zip';
import { Clues } from 'common/modules/crosswords/clues';
import { Controls } from 'common/modules/crosswords/controls';
import { HiddenInput } from 'common/modules/crosswords/hidden-input';
import { Grid } from 'common/modules/crosswords/grid';
import {
	buildClueMap,
	buildGrid,
	otherDirection,
	entryHasCell,
	cluesFor,
	mapGrid,
	getClearableCellsForClue,
	getLastCellInClue,
	getPreviousClueInGroup,
	isFirstCellInClue,
	getNextClueInGroup,
	isLastCellInClue,
	gridSize,
	checkClueHasBeenAnswered,
	buildSeparatorMap,
	cellsForEntry,
} from 'common/modules/crosswords/helpers';
import { keycodes } from 'common/modules/crosswords/keycodes';
import {
	saveGridState,
	loadGridState,
} from 'common/modules/crosswords/persistence';
import { classNames } from 'common/modules/crosswords/classNames';

class Crossword extends Component {
	constructor(props) {
		super(props);
		const dimensions = this.props.data.dimensions;

		this.columns = dimensions.cols;
		this.rows = dimensions.rows;
		this.clueMap = buildClueMap(this.props.data.entries);

		this.state = {
			grid: buildGrid(
				dimensions.rows,
				dimensions.cols,
				this.props.data.entries,
				loadGridState(this.props.data.id),
			),
			cellInFocus: null,
			directionOfEntry: null,
			showAnagramHelper: false,
		};
	}

	componentDidMount() {
		// Sticky clue
		const $stickyClueWrapper = $(findDOMNode(this.stickyClueWrapper));
		const $grid = $(findDOMNode(this.grid));
		const $game = $(findDOMNode(this.game));

		mediator.on(
			'window:resize',
			debounce(this.setGridHeight.bind(this), 200),
		);
		mediator.on(
			'window:orientationchange',
			debounce(this.setGridHeight.bind(this), 200),
		);
		this.setGridHeight();

		mediator.on('window:throttledScroll', () => {
			const gridOffset = $grid.offset();
			const gameOffset = $game.offset();
			const stickyClueWrapperOffset = $stickyClueWrapper.offset();
			const scrollY = window.scrollY;

			fastdom.mutate(() => {
				// Clear previous state
				$stickyClueWrapper
					.css('top', '')
					.css('bottom', '')
					.removeClass('is-fixed');

				const scrollYPastGame = scrollY - gameOffset.top;

				if (scrollYPastGame >= 0) {
					const gridOffsetBottom = gridOffset.top + gridOffset.height;

					if (
						scrollY >
						gridOffsetBottom - stickyClueWrapperOffset.height
					) {
						$stickyClueWrapper.css('top', 'auto').css('bottom', 0);
					} else if (isIOS()) {
						// iOS doesn't support sticky things when the keyboard
						// is open, so we use absolute positioning and
						// programatically update the value of top
						$stickyClueWrapper.css('top', scrollYPastGame);
					} else {
						$stickyClueWrapper.addClass('is-fixed');
					}
				}
			});
		});
	}

	componentDidUpdate(prevProps, prevState) {
		// return focus to active cell after exiting anagram helper
		if (
			!this.state.showAnagramHelper &&
			this.state.showAnagramHelper !== prevState.showAnagramHelper
		) {
			this.focusCurrentCell();
		}
	}

	onKeyDown(event) {
		const cell = this.state.cellInFocus;

		if (event.keyCode === keycodes.tab) {
			event.preventDefault();
			if (event.shiftKey) {
				this.focusPreviousClue();
			} else {
				this.focusNextClue();
			}
		} else if (!event.metaKey && !event.ctrlKey && !event.altKey) {
			if (
				event.keyCode === keycodes.backspace ||
				event.keyCode === keycodes.delete
			) {
				event.preventDefault();
				if (cell) {
					if (this.cellIsEmpty(cell.x, cell.y)) {
						this.focusPrevious();
					} else {
						this.setCellValue(cell.x, cell.y, '');
						this.save();
					}
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

	// called when cell is selected (by click or programtically focussed)
	onSelect(x, y) {
		const cellInFocus = this.state.cellInFocus;
		const clue = cluesFor(this.clueMap, x, y);
		const focussedClue = this.clueInFocus();
		let newDirection;

		const isInsideFocussedClue = () =>
			focussedClue ? entryHasCell(focussedClue, x, y) : false;

		if (
			cellInFocus &&
			cellInFocus.x === x &&
			cellInFocus.y === y &&
			this.state.directionOfEntry
		) {
			/** User has clicked again on the highlighted cell, meaning we ought to swap direction */
			newDirection = otherDirection(this.state.directionOfEntry);

			if (clue[newDirection]) {
				this.focusClue(x, y, newDirection);
			}
		} else if (isInsideFocussedClue() && this.state.directionOfEntry) {
			/**
			 * If we've clicked inside the currently highlighted clue, then we ought to just shift the cursor
			 * to the new cell, not change direction or anything funny.
			 */

			this.focusClue(x, y, this.state.directionOfEntry);
		} else {
			this.state.cellInFocus = {
				x,
				y,
			};

			const isStartOfClue = (sourceClue) =>
				!!sourceClue &&
				sourceClue.position.x === x &&
				sourceClue.position.y === y;

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

	onCheat() {
		this.allHighlightedClues().forEach((clue) => this.cheat(clue));
		this.save();
	}

	onCheck() {
		// 'Check this' checks single and grouped clues
		this.allHighlightedClues().forEach((clue) => this.check(clue));
		this.save();
	}

	onSolution() {
		this.props.data.entries.forEach((clue) => this.cheat(clue));
		this.save();
	}

	onCheckAll() {
		this.props.data.entries.forEach((clue) => this.check(clue));
		this.save();
	}

	onClearAll() {
		this.setState({
			grid: mapGrid(this.state.grid, (cell) => {
				cell.value = '';
				return cell;
			}),
		});

		this.save();
	}

	onClearSingle() {
		const clueInFocus = this.clueInFocus();

		if (clueInFocus) {
			// Merge arrays of cells from all highlighted clues
			// const cellsInFocus = _.flatten(_.map(this.allHighlightedClues(), helpers.cellsForEntry, this));
			const cellsInFocus = getClearableCellsForClue(
				this.state.grid,
				this.clueMap,
				this.props.data.entries,
				clueInFocus,
			);

			this.setState({
				grid: mapGrid(this.state.grid, (cell, gridX, gridY) => {
					if (
						cellsInFocus.some((c) => c.x === gridX && c.y === gridY)
					) {
						cell.value = '';
					}
					return cell;
				}),
			});

			this.save();
		}
	}

	onToggleAnagramHelper() {
		// only show anagram helper if a clue is active
		if (!this.state.showAnagramHelper) {
			if (this.clueInFocus()) {
				this.setState({
					showAnagramHelper: true,
				});
			}
		} else {
			this.setState({
				showAnagramHelper: false,
			});
		}
	}

	onClickHiddenInput(event) {
		const focussed = this.state.cellInFocus;

		if (focussed) {
			this.onSelect(focussed.x, focussed.y);
		}

		/* We need to handle touch seperately as touching an input on iPhone does not fire the
         click event - listen for a touchStart and preventDefault to avoid calling onSelect twice on
         devices that fire click AND touch events. The click event doesn't fire only when the input is already focused */
		if (event.type === 'touchstart') {
			event.preventDefault();
		}
	}

	setGridHeight() {
		if (!this.$gridWrapper) {
			this.$gridWrapper = $(findDOMNode(this.gridWrapper));
		}

		if (
			isBreakpoint({
				max: 'tablet',
			})
		) {
			fastdom.measure(() => {
				// Our grid is a square, set the height of the grid wrapper
				// to the width of the grid wrapper
				fastdom.mutate(() => {
					this.$gridWrapper.css(
						'height',
						`${this.$gridWrapper.offset().width}px`,
					);
				});
				this.gridHeightIsSet = true;
			});
		} else if (this.gridHeightIsSet) {
			// Remove inline style if tablet and wider
			this.$gridWrapper.attr('style', '');
		}
	}

	setCellValue(x, y, value) {
		this.setState({
			grid: mapGrid(this.state.grid, (cell, gridX, gridY) => {
				if (gridX === x && gridY === y) {
					cell.value = value;
					cell.isError = false;
				}

				return cell;
			}),
		});
	}

	getCellValue(x, y) {
		return this.state.grid[x][y].value;
	}

	setReturnPosition(position) {
		this.returnPosition = position;
	}

	insertCharacter(character) {
		const characterUppercase = character.toUpperCase();
		const cell = this.state.cellInFocus;
		if (
			/[A-Za-zÀ-ÿ0-9]/.test(characterUppercase) &&
			characterUppercase.length === 1 &&
			cell
		) {
			this.setCellValue(cell.x, cell.y, characterUppercase);
			this.save();
			this.focusNext();
		}
	}

	cellIsEmpty(x, y) {
		return !this.getCellValue(x, y);
	}

	goToReturnPosition() {
		if (
			isBreakpoint({
				max: 'mobile',
			})
		) {
			if (this.returnPosition) {
				scrollTo(this.returnPosition, 250, 'easeOutQuad');
			}
			this.returnPosition = null;
		}
	}

	indexOfClueInFocus() {
		return this.props.data.entries.indexOf(this.clueInFocus());
	}

	focusPreviousClue() {
		const i = this.indexOfClueInFocus();
		const entries = this.props.data.entries;

		if (i !== -1) {
			const newClue = entries[i === 0 ? entries.length - 1 : i - 1];
			this.focusClue(
				newClue.position.x,
				newClue.position.y,
				newClue.direction,
			);
		}
	}

	focusNextClue() {
		const i = this.indexOfClueInFocus();
		const entries = this.props.data.entries;

		if (i !== -1) {
			const newClue = entries[i === entries.length - 1 ? 0 : i + 1];
			this.focusClue(
				newClue.position.x,
				newClue.position.y,
				newClue.direction,
			);
		}
	}

	moveFocus(deltaX, deltaY) {
		const cell = this.state.cellInFocus;

		if (!cell) {
			return;
		}

		const x = cell.x + deltaX;
		const y = cell.y + deltaY;
		let direction = 'down';

		if (
			this.state.grid[x] &&
			this.state.grid[x][y] &&
			this.state.grid[x][y].isEditable
		) {
			if (deltaY !== 0) {
				direction = 'down';
			} else if (deltaX !== 0) {
				direction = 'across';
			}
			this.focusClue(x, y, direction);
		}
	}

	isAcross() {
		return this.state.directionOfEntry === 'across';
	}

	focusPrevious() {
		const cell = this.state.cellInFocus;
		const clue = this.clueInFocus();

		if (cell && clue) {
			if (isFirstCellInClue(cell, clue)) {
				const newClue = getPreviousClueInGroup(
					this.props.data.entries,
					clue,
				);
				if (newClue) {
					const newCell = getLastCellInClue(newClue);
					this.focusClue(newCell.x, newCell.y, newClue.direction);
				}
			} else if (this.isAcross()) {
				this.moveFocus(-1, 0);
			} else {
				this.moveFocus(0, -1);
			}
		}
	}

	focusNext() {
		const cell = this.state.cellInFocus;
		const clue = this.clueInFocus();

		if (cell && clue) {
			if (isLastCellInClue(cell, clue)) {
				const newClue = getNextClueInGroup(
					this.props.data.entries,
					clue,
				);
				if (newClue) {
					this.focusClue(
						newClue.position.x,
						newClue.position.y,
						newClue.direction,
					);
				}
			} else if (this.isAcross()) {
				this.moveFocus(1, 0);
			} else {
				this.moveFocus(0, 1);
			}
		}
	}

	asPercentage(x, y) {
		const width = gridSize(this.columns);
		const height = gridSize(this.rows);

		return {
			x: (100 * x) / width,
			y: (100 * y) / height,
		};
	}

	focusHiddenInput(x, y) {
		const wrapper = findDOMNode(this.hiddenInputComponent.wrapper);
		const left = gridSize(x);
		const top = gridSize(y);
		const position = this.asPercentage(left, top);

		/** This has to be done before focus to move viewport accordingly */
		wrapper.style.left = `${position.x}%`;
		wrapper.style.top = `${position.y}%`;

		const hiddenInputNode = findDOMNode(this.hiddenInputComponent.input);

		if (document.activeElement !== hiddenInputNode) {
			hiddenInputNode.focus();
		}
	}

	// Focus corresponding clue for a given cell
	focusClue(x, y, direction) {
		const clues = cluesFor(this.clueMap, x, y);
		const clue = clues[direction];

		if (clues && clue) {
			this.focusHiddenInput(x, y);

			this.setState({
				grid: this.state.grid,
				cellInFocus: {
					x,
					y,
				},
				directionOfEntry: direction,
			});

			// Side effect
			window.history.replaceState(
				undefined,
				document.title,
				`#${clue.id}`,
			);
		}
	}

	// Focus first cell in given clue
	focusFirstCellInClue(entry) {
		this.focusClue(entry.position.x, entry.position.y, entry.direction);
	}

	focusCurrentCell() {
		if (this.state.cellInFocus) {
			this.focusHiddenInput(
				this.state.cellInFocus.x,
				this.state.cellInFocus.y,
			);
		}
	}

	clueInFocus() {
		if (this.state.cellInFocus) {
			const cluesForCell = cluesFor(
				this.clueMap,
				this.state.cellInFocus.x,
				this.state.cellInFocus.y,
			);

			if (this.state.directionOfEntry) {
				return cluesForCell[this.state.directionOfEntry];
			}
		}
		return null;
	}

	allHighlightedClues() {
		return this.props.data.entries.filter((clue) =>
			this.clueIsInFocusGroup(clue),
		);
	}

	clueIsInFocusGroup(clue) {
		if (this.state.cellInFocus) {
			const cluesForCell = cluesFor(
				this.clueMap,
				this.state.cellInFocus.x,
				this.state.cellInFocus.y,
			);

			if (
				this.state.directionOfEntry &&
				cluesForCell[this.state.directionOfEntry]
			) {
				return cluesForCell[this.state.directionOfEntry].group.includes(
					clue.id,
				);
			}
		}
		return false;
	}

	cluesData() {
		return this.props.data.entries.map((entry) => {
			const hasAnswered = checkClueHasBeenAnswered(
				this.state.grid,
				entry,
			);
			return {
				entry,
				hasAnswered,
				isSelected: this.clueIsInFocusGroup(entry),
			};
		});
	}

	save() {
		saveGridState(this.props.data.id, this.state.grid);
	}

	cheat(entry) {
		const cells = cellsForEntry(entry);

		if (entry.solution) {
			this.setState({
				grid: mapGrid(this.state.grid, (cell, x, y) => {
					if (cells.some((c) => c.x === x && c.y === y)) {
						const n =
							entry.direction === 'across'
								? x - entry.position.x
								: y - entry.position.y;

						cell.value = entry.solution[n];
					}

					return cell;
				}),
			});
		}
	}

	check(entry) {
		const cells = cellsForEntry(entry);

		if (entry.solution) {
			const badCells = zip(cells, entry.solution.split(''))
				.filter((cellAndSolution) => {
					const coords = cellAndSolution[0];
					const cell = this.state.grid[coords.x][coords.y];
					const solution = cellAndSolution[1];
					return (
						/^[A-Z]$/.test(cell.value) && cell.value !== solution
					);
				})
				.map((cellAndSolution) => cellAndSolution[0]);

			this.setState({
				grid: mapGrid(this.state.grid, (cell, gridX, gridY) => {
					if (
						badCells.some(
							(bad) => bad.x === gridX && bad.y === gridY,
						)
					) {
						cell.isError = true;
						cell.value = '';
					}

					return cell;
				}),
			});

			setTimeout(() => {
				this.setState({
					grid: mapGrid(this.state.grid, (cell, gridX, gridY) => {
						if (
							badCells.some(
								(bad) => bad.x === gridX && bad.y === gridY,
							)
						) {
							cell.isError = false;
							cell.value = '';
						}

						return cell;
					}),
				});
			}, 150);
		}
	}

	hiddenInputValue() {
		const cell = this.state.cellInFocus;

		let currentValue;

		if (cell) {
			currentValue = this.state.grid[cell.x][cell.y].value;
		}

		return currentValue || '';
	}

	hasSolutions() {
		return 'solution' in this.props.data.entries[0];
	}

	isHighlighted(x, y) {
		const focused = this.clueInFocus();
		return focused
			? focused.group.some((id) => {
					const entry = this.props.data.entries.find(
						(e) => e.id === id,
					);
					return entryHasCell(entry, x, y);
			  })
			: false;
	}

	render() {
		const focused = this.clueInFocus();

		const anagramHelper = this.state.showAnagramHelper && (
			<AnagramHelper
				crossword={this}
				focussedEntry={focused}
				entries={this.props.data.entries}
				grid={this.state.grid}
				close={this.onToggleAnagramHelper}
			/>
		);

		const gridProps = {
			rows: this.rows,
			columns: this.columns,
			cells: this.state.grid,
			separators: buildSeparatorMap(this.props.data.entries),
			crossword: this,
			focussedCell: this.state.cellInFocus,
			ref: (grid) => {
				this.grid = grid;
			},
		};

		return (
			<div
				className={`crossword__container crossword__container--${this.props.data.dimensions.cols}cell crossword__container--react`}
				data-link-name="Crosswords"
			>
				<div
					className="crossword__container__game"
					ref={(game) => {
						this.game = game;
					}}
				>
					<div
						className="crossword__sticky-clue-wrapper"
						ref={(stickyClueWrapper) => {
							this.stickyClueWrapper = stickyClueWrapper;
						}}
					>
						<div
							className={classNames({
								'crossword__sticky-clue': true,
								'is-hidden': !focused,
							})}
						>
							{focused && (
								<div className="crossword__sticky-clue__inner">
									<div className="crossword__sticky-clue__inner__inner">
										<strong>
											{focused.number}{' '}
											<span className="crossword__sticky-clue__direction">
												{focused.direction}{' '}
											</span>
										</strong>
										<span
											dangerouslySetInnerHTML={{
												__html: focused.clue,
											}}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
					<div
						className="crossword__container__grid-wrapper"
						ref={(gridWrapper) => {
							this.gridWrapper = gridWrapper;
						}}
					>
						{Grid(gridProps)}
						<HiddenInput
							crossword={this}
							value={this.hiddenInputValue()}
							ref={(hiddenInputComponent) => {
								this.hiddenInputComponent =
									hiddenInputComponent;
							}}
						/>
						{anagramHelper}
					</div>
				</div>
				<Controls
					hasSolutions={this.hasSolutions()}
					clueInFocus={focused}
					crossword={this}
				/>
				<Clues
					clues={this.cluesData()}
					focussed={focused}
					setReturnPosition={this.setReturnPosition.bind(this)}
				/>
			</div>
		);
	}
}

export default Crossword;
