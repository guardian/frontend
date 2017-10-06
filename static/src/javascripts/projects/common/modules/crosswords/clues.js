// @flow
import { createElement, createClass, findDOMNode } from 'react/addons';
import bean from 'bean';
import fastdom from 'fastdom';
import { classNames } from 'common/modules/crosswords/classNames';
import { isBreakpoint } from 'lib/detect';
import { scrollTo } from 'lib/scroller';

const Clue = createClass({
    onClick() {
        this.props.setReturnPosition();
    },

    render() {
        return createElement(
            'li',
            null,
            createElement(
                'a',
                {
                    href: `#${this.props.id}`,
                    onClick: this.onClick,
                    className: classNames({
                        crossword__clue: true,
                        'crossword__clue--answered': this.props.hasAnswered,
                        'crossword__clue--selected': this.props.isSelected,
                        'crossword__clue--display-group-order':
                            JSON.stringify(this.props.number) !==
                            this.props.humanNumber,
                    }),
                },
                createElement(
                    'div',
                    {
                        className: 'crossword__clue__number',
                    },
                    this.props.humanNumber
                ),
                createElement('div', {
                    className: 'crossword__clue__text',
                    dangerouslySetInnerHTML: {
                        __html: this.props.clue,
                    },
                })
            )
        );
    },
});

const Clues = createClass({
    getInitialState() {
        return {
            showGradient: true,
        };
    },

    componentDidMount() {
        this.$cluesNode = findDOMNode(this.refs.clues);

        const height =
            this.$cluesNode.scrollHeight - this.$cluesNode.clientHeight;

        bean.on(this.$cluesNode, 'scroll', e => {
            const showGradient = height - e.currentTarget.scrollTop > 25;

            if (this.state.showGradient !== showGradient) {
                this.setState({
                    showGradient,
                });
            }
        });
    },

    /**
     * Scroll clues into view when they're activated (i.e. clicked in the grid)
     */
    componentDidUpdate(prev) {
        if (
            isBreakpoint({
                min: 'tablet',
                max: 'leftCol',
            }) &&
            (!prev.focussed || prev.focussed.id !== this.props.focussed.id)
        ) {
            fastdom.read(() => {
                this.scrollIntoView(this.props.focussed);
            });
        }
    },

    scrollIntoView(clue: Object) {
        const buffer = 100;
        const node = findDOMNode(this.refs[clue.id]);
        const visible =
            node.offsetTop - buffer > this.$cluesNode.scrollTop &&
            node.offsetTop + buffer <
                this.$cluesNode.scrollTop + this.$cluesNode.clientHeight;

        if (!visible) {
            const offset = node.offsetTop - this.$cluesNode.clientHeight / 2;
            scrollTo(offset, 250, 'easeOutQuad', this.$cluesNode);
        }
    },

    render() {
        const headerClass = 'crossword__clues-header';
        const cluesByDirection = direction =>
            this.props.clues
                .filter(clue => clue.entry.direction === direction)
                .map(clue =>
                    createElement(Clue, {
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
                        },
                    })
                );

        return createElement(
            'div',
            {
                className: `crossword__clues--wrapper ${this.state.showGradient
                    ? ''
                    : 'hide-gradient'}`,
            },
            createElement(
                'div',
                {
                    className: 'crossword__clues',
                    ref: 'clues',
                },
                createElement(
                    'div',
                    {
                        className: 'crossword__clues--across',
                    },
                    createElement(
                        'h3',
                        {
                            className: headerClass,
                        },
                        'Across'
                    ),
                    createElement(
                        'ol',
                        {
                            className: 'crossword__clues-list',
                        },
                        cluesByDirection('across')
                    )
                ),
                createElement(
                    'div',
                    {
                        className: 'crossword__clues--down',
                    },
                    createElement(
                        'h3',
                        {
                            className: headerClass,
                        },
                        'Down'
                    ),
                    createElement(
                        'ol',
                        {
                            className: 'crossword__clues-list',
                        },
                        cluesByDirection('down')
                    )
                )
            ),
            createElement('div', {
                className: 'crossword__clues__gradient',
            })
        );
    },
});

export { Clues };
