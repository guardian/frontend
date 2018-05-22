// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import { FeedbackFlashBox } from 'common/modules/identity/ad-prefs/FeedbackFlashBox';
import { ConsentBox } from 'common/modules/identity/ad-prefs/ConsentBox';

import fastdom from 'lib/fastdom-promise';
import {
    getAdConsentState,
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';

type AdConsentWithState = {
    consent: AdConsent,
    state: ?boolean,
};

type AdPrefsWrapperProps = {
    getAdConsentState: (consent: AdConsent) => ?boolean,
    setAdConsentState: (consent: AdConsent, state: boolean) => void,
    allAdConsents: AdConsent[],
};

const rootSelector: string = '.js-manage-account__ad-prefs';

class AdPrefsWrapper extends Component<
    AdPrefsWrapperProps,
    { consentsWithState: AdConsentWithState[], changesPending: boolean }
> {
    constructor(props: AdPrefsWrapperProps): void {
        super(props);
        this.state = {
            changesPending: false,
            consentsWithState: this.props.allAdConsents.map(
                (consent: AdConsent) => ({
                    consent,
                    state: this.props.getAdConsentState(consent),
                })
            ),
        };
    }

    onUpdate(consentId: number, state: ?boolean): void {
        const consentsWithState = [...this.state.consentsWithState];
        const changesPending = this.props.getAdConsentState(consentsWithState[consentId].consent) !== state;
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
                this.props.setAdConsentState(
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
                                onUpdate={(state: ?boolean) => {
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
        .read(() => [...document.querySelectorAll(rootSelector)])
        .then((wrapperEls: HTMLElement[]) => {
            wrapperEls.forEach(_ => {
                fastdom.write(() => {
                    render(
                        <AdPrefsWrapper
                            allAdConsents={allAdConsents}
                            getAdConsentState={getAdConsentState}
                            setAdConsentState={setAdConsentState}
                        />,
                        _
                    );
                });
            });
        });
};

export { enhanceAdPrefs };
