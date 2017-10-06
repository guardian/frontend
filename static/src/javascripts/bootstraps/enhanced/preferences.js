// @flow
import React from 'react/addons';
import {
    getPopularFiltered,
    deleteFromSummary,
    showInMegaNav,
    showInMegaNavEnable,
    showInMegaNavEnabled,
} from 'common/modules/onward/history';

const init = (): void => {
    const placeholder: ?HTMLElement = document.getElementById(
        'preferences-history-tags'
    );

    const initialiseSummaryTagsSettings = () => {
        const SummaryTagsList: React = React.createClass({
            getInitialState() {
                return {
                    popular: getPopularFiltered(),
                };
            },
            handleRemove(tag: string) {
                deleteFromSummary(tag);
                this.setState({
                    popular: getPopularFiltered({ flush: true }),
                });
                showInMegaNav();
            },
            render() {
                const tags: Object = this.state.popular.reduce((obj, tag) => {
                    obj[tag[0]] = React.DOM.span(
                        {
                            className:
                                'button button--small button--tag button--secondary',
                        },
                        React.DOM.button(
                            {
                                onClick: this.handleRemove.bind(this, tag[0]),
                                'data-link-name': `remove | ${tag[1]}`,
                            },
                            'X'
                        ),
                        React.DOM.a(
                            {
                                href: `/${tag[0]}`,
                            },
                            tag[1]
                        )
                    );
                    return obj;
                }, {});

                let helperText;

                if (!tags || !Object.keys(tags).length) {
                    helperText =
                        "(You don't have any recently visited topics.)";
                } else {
                    helperText =
                        "Remove individual topics by clicking 'X' or switch off the functionality below. We respect your privacy and your shortcuts will never be made public.";
                }
                tags.helperText = React.DOM.p(null, helperText);
                return React.DOM.div(null, tags);
            },
        });

        const SummaryTagsSettings: React = React.createClass({
            getInitialState() {
                return {
                    enabled: showInMegaNavEnabled(),
                };
            },
            handleToggle() {
                const isEnabled = !this.state.enabled;

                this.setState({
                    enabled: isEnabled,
                });
                showInMegaNavEnable(isEnabled);
            },
            render() {
                const self = this;
                const toggleAction = this.state.enabled ? 'OFF' : 'ON';

                return React.DOM.div(
                    {
                        'data-link-name': 'suggested links',
                    },
                    [
                        React.DOM.p(
                            null,
                            'These are based on the topics you visit most. You can access them at any time by opening the "all sections” menu.'
                        ),
                        this.state.enabled
                            ? React.createElement(SummaryTagsList)
                            : null,
                        React.DOM.button(
                            {
                                onClick: self.handleToggle,
                                className:
                                    'button button--medium button--primary',
                                'data-link-name': toggleAction,
                            },
                            `Switch recently visited links ${toggleAction}`
                        ),
                    ]
                );
            },
        });

        React.render(React.createElement(SummaryTagsSettings), placeholder);
    };

    if (placeholder) {
        initialiseSummaryTagsSettings();
    }
};

export { init };
