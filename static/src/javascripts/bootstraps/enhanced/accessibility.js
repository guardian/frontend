// @flow
import React from 'react/addons';
import { saveState, isOn } from 'common/modules/accessibility/main';

const DOM_ID: string = 'js-accessibility-preferences';

type AccessibilityState = {
    'flashing-elements': boolean,
};

const BinaryToggle = React.createClass({
    render() {
        return React.DOM.div(
            {
                className: 'form-field',
            },
            React.DOM.div(
                {
                    className: 'checkbox',
                },
                React.DOM.label(
                    {
                        className: 'label',
                    },
                    [
                        React.DOM.input({
                            key: this.props.name,
                            type: 'checkbox',
                            'data-link-name': this.props.name,
                            defaultChecked: this.props.enabled,
                            onChange: this.props.handleChange,
                            // TODO damn me when I decided to implement this page
                            // global.css includes pasteup-forms 5 which applies ugly styles
                            // on all inputs. The proper solution is to upgrade pasteup to 6
                            // but I prefer to leave the pleasure to someone else
                            // The style object should be removed once we upgrade. Never probably.
                            style: {
                                float: 'none',
                                margin: '3px 0.5ex',
                            },
                        }),
                    ].concat(this.props.label)
                )
            )
        );
    },
});

const Accessibility = React.createClass({
    getInitialState(): AccessibilityState {
        return {
            'flashing-elements': isOn('flashing-elements'),
        };
    },

    toggle(key: string): void {
        const newState = {};
        newState[key] = !this.state[key];
        this.setState(newState, function() {
            saveState(this.state);
        });
    },

    render(): Object {
        return React.DOM.form(
            {
                className: 'form',
            },
            React.DOM.fieldset(
                {
                    className: 'fieldset',
                },
                [
                    React.DOM.p(
                        {
                            key: 'p1',
                        },
                        "We aim to make this site accessible to a wide audience and to ensure a great experience for all users by conforming to World Wide Web Consortium accessibility guidelines (W3C's WCAG)"
                    ),
                    React.DOM.p(
                        {
                            key: 'p2',
                        },
                        'However, if you are having trouble reading this website you can change the way it looks or disable some of its functionalities.'
                    ),
                    React.createElement(BinaryToggle, {
                        key: 'flashing-elements',
                        name: 'flashing-elements',
                        label: [
                            React.DOM.strong(
                                {
                                    key: 'label',
                                },
                                'Allow flashing elements'
                            ),
                            this.state['flashing-elements']
                                ? ' Untick this to disable flashing and moving elements'
                                : ' Tick this to enable flashing or moving elements.',
                        ],
                        enabled: this.state['flashing-elements'],
                        handleChange: this.toggle.bind(
                            this,
                            'flashing-elements'
                        ),
                    }),
                ]
            )
        );
    },
});

const init = (callback: () => void): void => {
    React.render(
        React.createElement(Accessibility),
        document.getElementById(DOM_ID),
        callback
    );
};

export { DOM_ID, init };
