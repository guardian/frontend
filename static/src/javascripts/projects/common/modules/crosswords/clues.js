import React from 'react/addons';
import bean from 'bean';
import fastdom from 'fastdom';
import classNames from 'common/modules/crosswords/classNames';
import detect from 'lib/detect';
import scroller from 'lib/scroller';
const Clue = React.createClass({

    onClick() {
        this.props.setReturnPosition();
    },

    render() {
        return React.createElement('li',
            null,
            React.createElement('a', {
                    href: '#' + this.props.id,
                    onClick: this.onClick,
                    className: classNames.classNames({
                        'crossword__clue': true,
                        'crossword__clue--answered': this.props.hasAnswered,
                        'crossword__clue--selected': this.props.isSelected,
                        'crossword__clue--display-group-order': JSON.stringify(this.props.number) !== this.props.humanNumber
                    })
                }, React.createElement('div', {
                    className: 'crossword__clue__number'
                }, this.props.humanNumber),
                React.createElement('div', {
                    className: 'crossword__clue__text',
                    dangerouslySetInnerHTML: {
                        __html: this.props.clue
                    }
                })
            )
        );
    }
});

const Clues = React.createClass({

    getInitialState() {
        return {
            showGradient: true
        };
    },

    componentDidMount() {
        this.$cluesNode = React.findDOMNode(this.refs.clues);

        const height = this.$cluesNode.scrollHeight - this.$cluesNode.clientHeight;

        bean.on(this.$cluesNode, 'scroll', e => {
            const showGradient = height - e.currentTarget.scrollTop > 25;

            if (this.state.showGradient !== showGradient) {
                this.setState({
                    showGradient
                });
            }
        });
    },

    /**
     * Scroll clues into view when they're activated (i.e. clicked in the grid)
     */
    componentDidUpdate(prev) {
        if (detect.isBreakpoint({
                min: 'tablet',
                max: 'leftCol'
            }) && (!prev.focussed || prev.focussed.id !== this.props.focussed.id)) {
            fastdom.read(() => {
                this.scrollIntoView(this.props.focussed);
            });
        }
    },

    scrollIntoView(clue) {
        const buffer = 100;
        const node = React.findDOMNode(this.refs[clue.id]);
        const visible = node.offsetTop - buffer > this.$cluesNode.scrollTop &&
            node.offsetTop + buffer < this.$cluesNode.scrollTop + this.$cluesNode.clientHeight;

        if (!visible) {
            const offset = node.offsetTop - (this.$cluesNode.clientHeight / 2);
            scroller.scrollTo(offset, 250, 'easeOutQuad', this.$cluesNode);
        }
    },

    render() {
        const headerClass = 'crossword__clues-header';
        const cluesByDirection = direction => this.props.clues.filter(clue => clue.entry.direction === direction).map(clue => React.createElement(Clue, {
            ref: clue.entry.id,
            id: clue.entry.id,
            key: clue.entry.id,
            number: clue.entry.number,
            humanNumber: clue.entry.humanNumber,
            clue: clue.entry.clue,
            hasAnswered: clue.hasAnswered,
            isSelected: clue.isSelected,
            setReturnPosition: () => {
                this.props.setReturnPosition(window.scrollY);
            }
        }));

        return React.createElement(
            'div', {
                className: 'crossword__clues--wrapper ' + (this.state.showGradient ? '' : 'hide-gradient')
            },
            React.createElement(
                'div', {
                    className: 'crossword__clues',
                    ref: 'clues'
                },
                React.createElement(
                    'div', {
                        className: 'crossword__clues--across'
                    },
                    React.createElement(
                        'h3', {
                            className: headerClass
                        },
                        'Across'
                    ),
                    React.createElement(
                        'ol', {
                            className: 'crossword__clues-list'
                        },
                        cluesByDirection('across')
                    )
                ),
                React.createElement(
                    'div', {
                        className: 'crossword__clues--down'
                    },
                    React.createElement(
                        'h3', {
                            className: headerClass
                        },
                        'Down'
                    ),
                    React.createElement(
                        'ol', {
                            className: 'crossword__clues-list'
                        },
                        cluesByDirection('down')
                    )
                )
            ),
            React.createElement('div', {
                className: 'crossword__clues__gradient'
            })
        );
    }
});

export default Clues;
