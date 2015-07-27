import React from 'react';
import _ from 'common/utils/_';

import ClueInput from './clue-input';
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

    getEntries () {
        return _.map(helpers.cellsForEntry(this.props.clue), coords => {
            return this.props.grid[coords.x][coords.y];
        });
    }

    reset () {
        this.setState({
            clueInput: '',
            showInput: true
        });
    }

    shuffle () {
        // todo
    }

    onClueInput (text) {
        this.setState({ clueInput: text });
    }

    render () {
        const inner = this.state.showInput ?
            <ClueInput
                value={this.state.clueInput}
                clue={this.props.clue}
                onChange={this.onClueInput} /> :

            <Shuffler clue={this.props.clue} />;

        return (
            <div className='crossword__anagram-helper-outer'>
                <div className='crossword__anagram-helper-inner'>
                    {inner}
                </div>

                <button className={'button button--large ' + (!this.state.clueInput && 'button--tertiary')}
                    onClick={this.reset}>
                    start again
                </button>

                <button className='button button--large'
                    onClick={this.shuffle}>
                    shuffle
                </button>
            </div>
        );
    }
}
