// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import fastdom from 'lib/fastdom-promise';
import {
    getAdConsentState,
    setAdConsentState,
    adConsentList,
} from './ad-prefs.lib';
import type { AdConsent } from './ad-prefs.lib';

const rootSelector: string = '.js-manage-account__ad-prefs';

type ConsentRadioButtonProps = {
    value: string,
    label: string,
    checked: boolean,
    consent: AdConsent,
    onToggle: () => void,
};

class ConsentRadioButton extends Component<ConsentRadioButtonProps, {}> {
    handleChange(event): void {
        if (event.target.checked) {
            this.props.onToggle();
        }
    }
    render() {
        const id = `gu-ad-prefs-${this.props.value.toString()}-${
            this.props.consent.cookie
        }`;
        const name = `gu-ad-prefs-${this.props.consent.cookie}`;

        return (
            <div>
                <label htmlFor={id}>
                    <input
                        type="radio"
                        name={name}
                        id={id}
                        value={this.props.value.toString()}
                        checked={this.props.checked}
                        onChange={this.handleChange.bind(this)}
                    />
                    {this.props.label}
                </label>
            </div>
        );
    }
}

class ConsentBox extends Component<
    { consent: AdConsent },
    { consentState: ?boolean }
> {
    constructor(props) {
        super(props);
        this.state = {
            consentState: getAdConsentState(this.props.consent),
        };
    }

    setConsentTo(state: boolean): void {
        setAdConsentState(this.props.consent, state);
        this.setState({
            consentState: getAdConsentState(this.props.consent),
        });
    }

    render() {
        return (
            <fieldset>
                <legend>
                    Allow personalised ads from {this.props.consent.label}
                </legend>
                <div>
                    <ConsentRadioButton
                        label="Turn on"
                        value="true"
                        checked={this.state.consentState === true}
                        consent={this.props.consent}
                        onToggle={() => this.setConsentTo(true)}
                    />
                    <ConsentRadioButton
                        label="Turn off"
                        value="false"
                        checked={this.state.consentState === false}
                        consent={this.props.consent}
                        onToggle={() => this.setConsentTo(false)}
                    />
                </div>
            </fieldset>
        );
    }
}

class ConsentBoxes extends Component<{}, {}> {
    render() {
        return (
            <div>
                {adConsentList.map((consent: AdConsent) => (
                    <ConsentBox consent={consent} key={consent.cookie} />
                ))}
            </div>
        );
    }
}

const enhanceAdPrefs = (): void => {
    fastdom
        .read(() => document.querySelectorAll(rootSelector))
        .then((wrapperEls: HTMLElement[]) => {
            wrapperEls.forEach(_ => {
                fastdom.write(() => {
                    _.classList.remove('is-hidden');
                    render(<ConsentBoxes />, _);
                });
            });
        });
};

export { enhanceAdPrefs };
