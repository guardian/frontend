import React from 'react';
import _ from 'common/utils/_';
import svgs from 'common/views/svgs';

import ClueInput from './clue-input';
import CluePreview from './clue-preview';
import Ring from './ring';
import helpers from '../helpers';

export default class AnagramHelper extends React.Component {
    constructor (props) {
        super(props);

        _.bindAll(this,
            'reset',
            'shuffle',
            'onClueInput'
        );

        this.state = {
            clueInput: '',
            showInput: true
        };
    }

    componentWillReceiveProps (next) {
        // reset on clue change
        if (next.clue !== this.props.focussedEntry) {
            this.reset();
        }
    }

    reset () {
        if (this.state.clueInput) {
            this.setState({
                clueInput: '',
                showInput: true
            });
        }
    }

    shuffle () {
        if (this.canShuffle()) {
            this.setState({ showInput: false });
        }
    }

    canShuffle () {
        return this.state.clueInput &&
               this.state.clueInput.length > 0;
    }

    /**
     * Shuffle the letters in the user's input.
     *
     * First, create an array of input characters that have already been entered
     * into the grid. Then build a new collection of letters, using the first
     * array to flag letters that are already entered in the puzzle, and
     * shuffle it.
     *
     * @param  {String}   word     word to shuffle
     * @param  {[Object]} entries  array of entries (i.e. grid cells)
     * @return {[Object]}          array of shuffled letters
     */
    shuffleWord (word, entries) {
        const wordEntries = _.chain(entries)
            .map(entry => entry.value.toLowerCase())
            .filter(entry => _.contains(word, entry))
            .compact()
            .value()
            .sort();

        return _.shuffle(_.reduce(word.trim().split('').sort(), (acc, letter) => {
            const entered = acc.entries[0] === letter.toLowerCase();

            return {
                letters: acc.letters.concat({ value: letter, entered: entered }),
                entries: entered ? _.rest(acc.entries) : acc.entries
            };
        }, { letters: [], entries: wordEntries }).letters);
    }

    onClueInput (text) {
        if (!/\s|\d/g.test(text)) {
            this.setState({ clueInput: text });
        }
    }

    render () {
        /* jscs:disable disallowDanglingUnderscores */
        const closeIcon = { __html: svgs('closeCentralIcon') };
        /* jscs:enable disallowDanglingUnderscores */
        const clue = helpers.getAnagramClueData(this.props.entries, this.props.focussedEntry);
        const cells = helpers.cellsForClue(this.props.entries, this.props.focussedEntry);
        const entries = _.map(cells, coords => this.props.grid[coords.x][coords.y]);
        const letters = this.shuffleWord(this.state.clueInput, entries);

        const inner = this.state.showInput ?
            <ClueInput value={this.state.clueInput} clue={clue} onChange={this.onClueInput} onEnter={this.shuffle} /> :
            <Ring letters={letters} />;

        return (
            <div className='crossword__anagram-helper-outer'>
                <div className='crossword__anagram-helper-inner'>
                    {inner}
                </div>

                <button className={'button button--large button--tertiary crossword__anagram-helper-close'}
                    onClick={this.props.close.bind(this)}
                    dangerouslySetInnerHTML={closeIcon}>
                </button>

                <button className={'button button--large ' + (!this.state.clueInput && 'button--tertiary')}
                    onClick={this.reset}>
                    start again
                </button>

                <button className={'button button--large '  + (!this.canShuffle() && 'button--tertiary')}
                    onClick={this.shuffle}>
                    shuffle
                </button>

                <CluePreview clue={clue} entries={entries} letters={letters} hasShuffled={!this.state.showInput} />
            </div>
        );
    }
}
