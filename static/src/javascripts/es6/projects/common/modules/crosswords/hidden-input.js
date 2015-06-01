import React from 'react';
import bonzo from 'bonzo';
import fastdom from 'fastdom';

import scroller from 'common/utils/scroller';
import detect from 'common/utils/detect';

export default class HiddenInput extends React.Component {

    constructor (props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {
            value: this.props.value
        };
    }

    componentDidUpdate () {
        if (detect.isBreakpoint({ max: 'mobile' })) {
            fastdom.read(function () {
                const offsets = bonzo(this.refs.input.getDOMNode()).offset();
                scroller.scrollTo(offsets.top - (offsets.height * 1.5), 250, 'easeOutQuad');
            }.bind(this));
        }
    }

    handleChange (event) {
        this.props.onChange(event.target.value.toUpperCase());
        this.setState({value: ''});
    }

    render () {
        return (
            <div className='crossword__hidden-input-wrapper' ref='wrapper'>
                <input type='text'
                    className='crossword__hidden-input'
                    maxLength='1'
                    onClick={this.props.onClick}
                    onChange={this.handleChange}
                    onKeyDown={this.props.onKeyDown}
                    onBlur={this.props.onBlur}
                    value={this.state.value}
                    autoComplete='off'
                    spellCheck='false'
                    autoCorrect='off'
                    ref='input'
                />
            </div>
        );
    }
}

