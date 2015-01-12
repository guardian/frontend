define([
    'react',
    'common/utils/_',
    'common/modules/experiments/ab',
    'common/modules/onward/history'
], function (
    React,
    _,
    ab,
    history
) {
    return function () {
        var SummaryTagsSettings = React.createClass({
                getInitialState: function () {
                    return { enabled: history.showInMegaNavEnabled() };
                },
                handleToggle: function () {
                    var isEnabled;

                    history.showInMegaNavToggle();

                    isEnabled = history.showInMegaNavEnabled();

                    this.setState({ enabled: isEnabled });

                    ab.addParticipation({id: 'HistoryTags'}, isEnabled ? 'show' : 'notintest');
                },
                render: function () {
                    var self = this,
                        toggleAction = this.state.enabled ? 'OFF' : 'ON';

                    return React.DOM.div({'data-link-name': 'suggested links'}, [
                        React.DOM.p(null, 'Suggested links are shown under \'browse all sections\', and are based on your recent browsing history.'),
                        this.state.enabled ? React.DOM.p(null, 'Remove links that don\'t interest you by clicking the \'X\' next to them.') : null,
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
