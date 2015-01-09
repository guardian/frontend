define([
    'react',
    'common/utils/_',
    'common/modules/onward/history'
], function (
    React,
    _,
    history
) {
    return function () {
        var SummaryTags = React.createClass({
            getInitialState: function () {
                return { popular: history.getPopularFiltered() };
            },
            handleRemove: function (tag) {
                history.deleteFromSummary(tag);
                this.setState({ popular: history.getPopularFiltered() });
                history.renderInMegaNav();
            },
            render: function () {
                var self = this;

                return React.DOM.div({},
                    _.reduce(this.state.popular, function (obj, tag) {
                        obj[tag[0]] = React.DOM.span({className: 'button button--small button--tag button--secondary'},
                            React.DOM.button({onClick: self.handleRemove.bind(self, tag[0])}, 'X'),
                            React.DOM.a({href: '/' + tag[0]}, tag[1])
                        );
                        return obj;
                    }, {})
                );
            }
        });

        React.renderComponent(
            React.createElement(SummaryTags),
            document.getElementById('preferences-history-tags')
        );
    };
});
