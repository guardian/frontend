/* eslint new-cap: 0 */

import classNames from 'classnames';
import React from 'react';
import bean from 'bean';
import fastdom from 'fastdom';

import _ from 'common/utils/_';
import detect from 'common/utils/detect';
import scroller from 'common/utils/scroller';

class Clue extends React.Component {

    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick () {
        this.props.setReturnPosition();
    }

    render () {
        return (
            <li>
                <a href={`#${this.props.id}`}
                   onClick={this.onClick}
                   className={classNames({
                    'crossword__clue': true,
                    'crossword__clue--answered': this.props.hasAnswered,
                    'crossword__clue--selected': this.props.isSelected,
                    'crossword__clue--display-group-order' : JSON.stringify(this.props.number) !== this.props.humanNumber
                })}>
                    <div className="crossword__clue__number">{this.props.humanNumber}</div>

                    <div className="crossword__clue__text"
                       /* jscs:disable disallowDanglingUnderscores */
                       dangerouslySetInnerHTML={{__html: this.props.clue}}
                       /* jscs:enable disallowDanglingUnderscores */
                    ></div>
                </a>
            </li>
        );
    }
}

export default class Clues extends React.Component {
    constructor (props) {
        super(props);
        this.state = { showGradient: true };
    }

    componentDidMount () {
        this.$cluesNode = React.findDOMNode(this.refs.clues);

        const height = this.$cluesNode.scrollHeight - this.$cluesNode.clientHeight;

        bean.on(this.$cluesNode, 'scroll', e => {
            const showGradient = height - e.currentTarget.scrollTop > 20;

            if (this.state.showGradient !== showGradient) {
                this.setState({ showGradient: showGradient });
            }
        });
    }

    /**
     * Scroll clues into view when they're activated (i.e. clicked in the grid)
     */
    componentDidUpdate (prev) {
        const tablet = detect.getBreakpoint() === 'tablet';

        if (tablet && (!prev.focussed || prev.focussed.id !== this.props.focussed.id)) {
            fastdom.read(() => this.scrollIntoView(this.props.focussed));
        }
    }

    scrollIntoView (clue) {
        const buffer = 100;
        const node = React.findDOMNode(this.refs[clue.id]);
        const visible = node.offsetTop - buffer > this.$cluesNode.scrollTop &&
                        node.offsetTop + buffer < this.$cluesNode.scrollTop + this.$cluesNode.clientHeight;

        if (!visible) {
            const offset = node.offsetTop - (this.$cluesNode.clientHeight / 2);
            scroller.scrollTo(offset, 250, 'easeOutQuad', this.$cluesNode);
        }
    }

    render () {
        const headerClass = 'crossword__clues-header';
        const cluesByDirection = (direction) => _.chain(this.props.clues)
            .filter((clue) => clue.entry.direction === direction)
            .map((clue) =>
                <Clue
                    ref={clue.entry.id}
                    id={clue.entry.id}
                    key={clue.entry.id}
                    number={clue.entry.number}
                    humanNumber={clue.entry.humanNumber}
                    clue={clue.entry.clue}
                    hasAnswered={clue.hasAnswered}
                    isSelected={clue.isSelected}
                    focusClue={() => {
                        this.props.focusClue(clue.entry.position.x, clue.entry.position.y, direction);
                    }}
                    setReturnPosition={() => {
                        this.props.setReturnPosition(window.scrollY);
                    }}
                />
            );

        return (
            <div className={'crossword__clues--wrapper ' + (this.state.showGradient ? '' : 'hide-gradient')}>
                <div className='crossword__clues' ref='clues'>
                    <div className='crossword__clues--across'>
                        <h3 className={headerClass}>Across</h3>
                        <ol className='crossword__clues-list'>
                            {cluesByDirection('across')}
                        </ol>
                    </div>
                    <div className='crossword__clues--down'>
                        <h3 className={headerClass}>Down</h3>
                        <ol className='crossword__clues-list'>
                            {cluesByDirection('down')}
                        </ol>
                    </div>
                </div>

                <div className='crossword__clues__gradient'></div>
            </div>
        );
    }
}

