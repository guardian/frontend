// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import fastdom from 'lib/fastdom-promise';
import {
    getAdConsentState,
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';

type AdConsentState = ?boolean;

type AdConsentWithState = {
    consent: AdConsent,
    state: AdConsentState,
};

type ConsentRadioButtonProps = {
    value: string,
    label: string,
    checked: boolean,
    consent: AdConsent,
    onToggle: () => void,
};

type ConsentBoxProps = {
    consent: AdConsent,
    state: AdConsentState,
    onUpdate: (state: AdConsentState) => void,
};

class BoopableBox extends Component<
    {
        children?: any,
    },
    {
        booping: boolean,
    }
> {
    boop() {
        this.setState({ booping: true });
        setTimeout(() => {
            this.setState({ booping: false });
        }, 500);
    }

    render() {
        return (
            <div
                style={{
                    display: this.state.booping ? 'block' : 'none',
                }}>
                {this.props.children}
            </div>
        );
    }
}

const rootSelector: string = '.js-manage-account__ad-prefs';

class ConsentRadioButton extends Component<ConsentRadioButtonProps, {}> {
    handleChange(event: SyntheticInputEvent<HTMLInputElement>): void {
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

class ConsentBox extends Component<ConsentBoxProps, {}> {
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
                        checked={this.props.state === true}
                        consent={this.props.consent}
                        onToggle={() => this.props.onUpdate(true)}
                    />
                    <ConsentRadioButton
                        label="Turn off"
                        value="false"
                        checked={this.props.state === false}
                        consent={this.props.consent}
                        onToggle={() => this.props.onUpdate(false)}
                    />
                </div>
            </fieldset>
        );
    }
}

class ConsentBoxes extends Component<
    {},
    { consentsWithState: AdConsentWithState[] }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            consentsWithState: allAdConsents.map((consent: AdConsent) => ({
                consent,
                state: getAdConsentState(consent),
            })),
        };
    }

    onUpdate(consentId, state: AdConsentState) {
        const consentsWithState = { ...this.state }.consentsWithState;
        consentsWithState[consentId].state = state;
        this.setState({
            consentsWithState,
        });
    }

    onSubmit(event: SyntheticInputEvent<HTMLFormElement>) {
        event.preventDefault();
        this.state.consentsWithState.forEach(consentWithState => {
            if (consentWithState.state) {
                setAdConsentState(
                    consentWithState.consent,
                    consentWithState.state
                );
            }
        });
        if (this.boopableBoxRef) this.boopableBoxRef.boop();
    }

    boopableBoxRef: ?BoopableBox = null;

    render() {
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <div>
                    {this.state.consentsWithState.map(
                        (consentWithState, index) => (
                            <ConsentBox
                                consent={consentWithState.consent}
                                state={consentWithState.state}
                                key={consentWithState.consent.cookie}
                                onUpdate={(state: AdConsentState) => {
                                    this.onUpdate(index, state);
                                }}
                            />
                        )
                    )}
                </div>
                <button type="submit">Save changes</button>
                <BoopableBox
                    ref={child => {
                        this.boopableBoxRef = child;
                    }}>
                    Saved
                </BoopableBox>
            </form>
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
