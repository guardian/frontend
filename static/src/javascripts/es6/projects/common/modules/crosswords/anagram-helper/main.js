import React from 'react';
import _ from 'common/utils/_';

import ClueInput from './clue-input';
import CluePreview from './clue-preview';
import Shuffler from './shuffler';
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
        if (next.clue !== this.props.clue) {
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
               this.state.clueInput.length === this.props.clue.length;
    }

    onClueInput (text) {
        if (!/\s|\d/g.test(text)) {
            this.setState({ clueInput: text });
        }
    }

    render () {
        const entries = _.map(helpers.cellsForEntry(this.props.clue), coords => {
            return this.props.grid[coords.x][coords.y];
        });

        const inner = this.state.showInput ?
            <ClueInput value={this.state.clueInput} clue={this.props.clue} onChange={this.onClueInput} /> :
            <Shuffler entries={entries} word={this.state.clueInput.trim().split('')} />;

        return (
            <div className='crossword__anagram-helper-outer'>
                <div className='crossword__anagram-helper-inner'>
                    {inner}
                </div>

                <button className={'button button--large ' + (!this.state.clueInput && 'button--tertiary')}
                    onClick={this.reset}>
                    start again
                </button>

                <button className={'button button--large '  + (!this.canShuffle() && 'button--tertiary')}
                    onClick={this.shuffle}>
                    shuffle
                </button>

                <CluePreview clue={this.props.clue} entries={entries} />
            </div>
        );
    }
}
