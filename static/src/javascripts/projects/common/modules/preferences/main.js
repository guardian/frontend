define([
    'react',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/modules/onward/history'
], function (
    React,
    _,
    $,
    config,
    history
) {
    return function () {
        var placeholder = document.getElementById('preferences-history-tags'),

            initialiseSummaryTagsSettings = function () {
                var SummaryTagsSettings = React.createClass({
                        getInitialState: function () {
                            return {enabled: history.showInMegaNavEnabled()};
                        },
                        handleToggle: function () {
                            var isEnabled = !this.state.enabled;

                            this.setState({enabled: isEnabled});
                            history.showInMegaNavEnable(isEnabled);
                        },
                        render: function () {
                            var self = this,
                                toggleAction = this.state.enabled ? 'OFF' : 'ON';

                            return React.DOM.div({'data-link-name': 'suggested links'}, [
                                React.DOM.p(null, 'These are based on the topics you visit most. You can access them at any time by opening the "all sections” menu.'),
                                this.state.enabled ? React.createElement(SummaryTagsList) : null,
                                React.DOM.button({
                                    onClick: self.handleToggle,
                                    className: 'button button--medium button--primary',
                                    'data-link-name': toggleAction
                                }, 'Switch recently visited links ' + toggleAction)
                            ]);
                        }
                    }),

                    SummaryTagsList = React.createClass({
                        getInitialState: function () {
                            return {popular: history.getPopularFiltered()};
                        },
                        handleRemove: function (tag) {
                            history.deleteFromSummary(tag);
                            this.setState({popular: history.getPopularFiltered({flush: true})});
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
                                helperText = '(You don\'t have any recently visited topics.)';
                            } else {
                                helperText = 'Remove individual topics by clicking \'X\' or switch off the functionality below. We respect your privacy and your shortcuts will never be made public.';
                            }
                            tags.helperText = React.DOM.p(null, helperText);
                            return React.DOM.div(null, tags);
                        }
                    });

                React.render(React.createElement(SummaryTagsSettings), placeholder);
            };

        switch (config.page.pageId) {
            case 'preferences/notifications':
                initialiseNotificationPreferences();
                break;
            case 'preferences':
                if (placeholder) {
                    initialiseSummaryTagsSettings();
                }
                break;
        }
    };
});
