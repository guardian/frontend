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
                        React.DOM.p(null, 'These links are based on your recent browsing history on this device. They are available under \'browse all sections\'.'),
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
                    this.setState({ popular: history.getPopularFiltered({flush: true}) });
                    history.showInMegaNav();
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
                        }, {}),
                        helperText;

                    if (_.isEmpty(tags)) {
                        helperText = '(You don\'t have any recently visited links.)';
                    } else {
                        helperText = 'Remove links that don\'t interest you by clicking the \'X\' next to them.';
                    }
                    tags.helperText = React.DOM.p(null, helperText);
                    return React.DOM.div(null, tags);
                }
            });

        React.renderComponent(
            React.createElement(SummaryTagsSettings),
            document.getElementById('preferences-history-tags')
        );
    };
});
