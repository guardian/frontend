// @flow
import React, { Component } from 'react';
import { render } from 'react-dom';
import { saveState, isOn } from 'common/modules/accessibility/main';

const DOM_ID: string = 'js-accessibility-preferences';

type AccessibilityState = {
    'flashing-elements': boolean,
};

class BinaryToggle extends Component<*, *> {
    render() {
        return (
            <div className="form-field">
                <div className="checkbox">
                    <label
                        className="label"
                        htmlFor={`checkbox-${this.props.name}`}>
                        <input
                            id={`checkbox-${this.props.name}`}
                            key={this.props.name}
                            type="checkbox"
                            data-link-name={this.props.name}
                            defaultChecked={this.props.enabled}
                            onChange={this.props.handleChange.bind(this)}
                            // TODO damn me when I decided to implement this page
                            // global.css includes pasteup-forms 5 which applies ugly styles
                            // on all inputs. The proper solution is to upgrade pasteup to 6
                            // but I prefer to leave the pleasure to someone else
                            // The style object should be removed once we upgrade. Never probably.
                            style={{
                                float: 'none',
                                margin: '3px 0.5ex',
                            }}
                        />
                        {this.props.label}
                    </label>
                </div>
            </div>
        );
    }
}

class Accessibility extends Component<*, *> {
    constructor() {
        super();
        this.state = ({
            'flashing-elements': isOn('flashing-elements'),
        }: AccessibilityState);
    }

    toggle(key: string): void {
        const newState = {};
        newState[key] = !this.state[key];
        this.setState(newState, function() {
            saveState(this.state);
        });
    }

    render(): Object {
        return (
            <form className="form">
                <fieldset className="fieldset">
                    <p key="p1">
                        We aim to make this site accessible to a wide audience
                        and to ensure a great experience for all users by
                        conforming to World Wide Web Consortium accessibility
                        guidelines (W3C&apos;s WCAG)
                    </p>
                    <p key="p2">
                        However, if you are having trouble reading this website
                        you can change the way it looks or disable some of its
                        functionalities.
                    </p>
                    <BinaryToggle
                        key="flashing-elements"
                        name="flashing-elements"
                        label={[
                            <strong key="label">
                                Allow flashing elements
                            </strong>,
                            this.state['flashing-elements']
                                ? ' Untick this to disable flashing and moving elements'
                                : ' Tick this to enable flashing or moving elements.',
                        ]}
                        enabled={this.state['flashing-elements']}
                        handleChange={this.toggle.bind(
                            this,
                            'flashing-elements'
                        )}
                    />
                </fieldset>
            </form>
        );
    }
}

const init = (callback: () => void): void => {
    const el = document.getElementById(DOM_ID);

    if (el) {
        render(<Accessibility />, el, callback);
    }
};

export { DOM_ID, init };
