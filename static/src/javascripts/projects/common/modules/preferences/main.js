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
                    return { enabled: history.showInMegaNavEnabled() && ab.getTestVariant('HistoryTags') === 'show' };
                },
                handleToggle: function () {
                    var isEnabled = !this.state.enabled;

                    this.setState({ enabled: isEnabled });
                    history.showInMegaNavEnable(isEnabled);
                    ab.setTestVariant('HistoryTags', isEnabled ? 'show' : 'notintest');
                },
                render: function () {
                    var self = this,
                        toggleAction = this.state.enabled ? 'OFF' : 'ON';

                    return React.DOM.div({'data-link-name': 'suggested links'}, [
                        React.DOM.p(null, 'Suggested links are shown under \'browse all sections\', and are based on your recent browsing history.'),
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
                    var self = this,
                        tags = _.reduce(this.state.popular, function (obj, tag) {
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
                        }, {});

                    if (!_.isEmpty(tags)) {
                        tags._p1 = React.DOM.p(null, '(remove links that don\'t interest you by clicking the \'X\' next to them.)');
                        return React.DOM.div(null, tags);
                    }
                }
            });

        React.renderComponent(
            React.createElement(SummaryTagsSettings),
            document.getElementById('preferences-history-tags')
        );
    };
});
