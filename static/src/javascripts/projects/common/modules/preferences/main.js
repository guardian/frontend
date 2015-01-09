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
        var SummaryTagsSettings = React.createClass({
                getInitialState: function () {
                    return { enabled: history.showInMegaNavEnabled() };
                },
                handleToggle: function () {
                    history.showInMegaNavToggle();
                    this.setState({ enabled: history.showInMegaNavEnabled() });
                },
                render: function () {
                    var self = this,
                        toggleAction = this.state.enabled ? 'OFF' : 'ON';

                    return React.DOM.div({'data-link-name': 'suggested links'}, [
                        React.DOM.p(null, 'Suggested links are shown under \'All Sections\', and are based by your recent browsing history. Remove links that don\'t interest you by clicking \'X\' next to them.'),
                        this.state.enabled ? React.createElement(SummaryTagsList) : null,
                        React.DOM.button({
                            onClick: self.handleToggle,
                            className: 'button button--medium button--primary',
                            'data-link-name': toggleAction
                        }, 'Switch suggested links ' + toggleAction)
                    ]);
                }
            }),

            SummaryTagsList = React.createClass({
                getInitialState: function () {
                    return { popular: history.getPopularFiltered() };
                },
                handleRemove: function (tag) {
                    history.deleteFromSummary(tag);
                    this.setState({ popular: history.getPopularFiltered() });
                    history.showInMegaNav(true);
                },
                render: function () {
                    var self = this;

                    return React.DOM.p(null, [
                        _.reduce(this.state.popular, function (obj, tag) {
                            obj[tag[0]] = React.DOM.span({className: 'button button--small button--tag button--secondary'},
                                React.DOM.button({
                                    onClick: self.handleRemove.bind(self, tag[0]),
                                    'data-link-name': 'remove | ' + tag[1]
                                }, 'X'),
                                React.DOM.a({
                                    href: '/' + tag[0]
                                }, tag[1])
                            );
                            return obj;
                        }, {})
                    ]);
                }
            });

        React.renderComponent(
            React.createElement(SummaryTagsSettings),
            document.getElementById('preferences-history-tags')
        );
    };
});
