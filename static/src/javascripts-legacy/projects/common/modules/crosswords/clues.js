define([
    'react/addons',
    'bean',
    'fastdom',
    './classNames',
    'common/utils/detect',
    'common/utils/scroller',
    'lodash/collections/map',
    'lodash/collections/filter',
    'common/utils/chain'
], function (React, bean, fastdom, classNames, detect, scroller, map, filter, chain) {
    var Clue = React.createClass({

        onClick: function () {
            this.props.setReturnPosition();
        },

        render: function () {
            return React.createElement('li',
                null,
                React.createElement('a', {
                        href: '#' + this.props.id,
                        onClick: this.onClick,
                        className: classNames({
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

    var Clues = React.createClass({

        getInitialState: function () {
            return {
                showGradient: true
            };
        },

        componentDidMount: function () {
            this.$cluesNode = React.findDOMNode(this.refs.clues);

            var height = this.$cluesNode.scrollHeight - this.$cluesNode.clientHeight;

            bean.on(this.$cluesNode, 'scroll', function (e) {
                var showGradient = height - e.currentTarget.scrollTop > 25;

                if (this.state.showGradient !== showGradient) {
                    this.setState({
                        showGradient: showGradient
                    });
                }
            }.bind(this));
        },

        /**
         * Scroll clues into view when they're activated (i.e. clicked in the grid)
         */
        componentDidUpdate: function (prev) {
            if (detect.isBreakpoint({
                    min: 'tablet',
                    max: 'leftCol'
                }) && (!prev.focussed || prev.focussed.id !== this.props.focussed.id)) {
                fastdom.read(function () {
                    this.scrollIntoView(this.props.focussed);
                }.bind(this));
            }
        },

        scrollIntoView: function (clue) {
            var buffer = 100;
            var node = React.findDOMNode(this.refs[clue.id]);
            var visible = node.offsetTop - buffer > this.$cluesNode.scrollTop &&
                node.offsetTop + buffer < this.$cluesNode.scrollTop + this.$cluesNode.clientHeight;

            if (!visible) {
                var offset = node.offsetTop - (this.$cluesNode.clientHeight / 2);
                scroller.scrollTo(offset, 250, 'easeOutQuad', this.$cluesNode);
            }
        },

        render: function () {
            var headerClass = 'crossword__clues-header';
            var cluesByDirection = function (direction) {
                return chain(this.props.clues).and(filter, function (clue) {
                        return clue.entry.direction === direction;
                    }).and(map, function (clue) {
                        return React.createElement(Clue, {
                            ref: clue.entry.id,
                            id: clue.entry.id,
                            key: clue.entry.id,
                            number: clue.entry.number,
                            humanNumber: clue.entry.humanNumber,
                            clue: clue.entry.clue,
                            hasAnswered: clue.hasAnswered,
                            isSelected: clue.isSelected,
                            setReturnPosition: function () {
                                this.props.setReturnPosition(window.scrollY);
                            }.bind(this)
                        });
                    }, this);
            }.bind(this);

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

    return Clues;
});
