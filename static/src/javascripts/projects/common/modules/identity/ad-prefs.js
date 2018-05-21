// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import { FeedbackFlashBox } from 'common/modules/identity/ad-prefs/FeedbackFlashBox';
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
            <label className="identity-ad-prefs-input" htmlFor={id}>
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
    { consentsWithState: AdConsentWithState[], changesPending: boolean }
> {
    constructor(props: {}): void {
        super(props);
        this.state = {
            changesPending: false,
            consentsWithState: allAdConsents.map((consent: AdConsent) => ({
                consent,
                state: getAdConsentState(consent),
            })),
        };
    }

    onUpdate(consentId: number, state: AdConsentState): void {
        const consentsWithState = [...this.state.consentsWithState];
        const changesPending = consentsWithState[consentId].state !== state;
        consentsWithState[consentId].state = state;
        this.setState({
            consentsWithState,
            changesPending,
        });
    }

    onSubmit(event: SyntheticInputEvent<HTMLFormElement>): void {
        event.preventDefault();
        this.state.consentsWithState.forEach(consentWithState => {
            if (typeof consentWithState.state === 'boolean') {
                setAdConsentState(
                    consentWithState.consent,
                    consentWithState.state
                );
            }
        });
        if (this.FeedbackFlashBoxRef) this.FeedbackFlashBoxRef.flash();
        this.setState({
            changesPending: false,
        });
    }

    FeedbackFlashBoxRef: ?FeedbackFlashBox = null;

    render() {
        return (
            <form
                className="identity-ad-prefs-manager"
                onSubmit={ev => this.onSubmit(ev)}>
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
                <div className="identity-ad-prefs-manager__footer">
                    <button
                        disabled={this.state.changesPending ? null : 'disabled'}
                        className="manage-account__button manage-account__button--center"
                        type="submit">
                        Save changes
                    </button>
                    <FeedbackFlashBox
                        ref={child => {
                            this.FeedbackFlashBoxRef = child;
                        }}>
                        Saved
                    </FeedbackFlashBox>
                </div>
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
