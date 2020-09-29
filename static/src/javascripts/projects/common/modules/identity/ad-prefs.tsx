

import React, { Component, render } from "preact-compat";
import { FeedbackFlashBox } from "common/modules/identity/ad-prefs/FeedbackFlashBox";
import { ConsentBox } from "common/modules/identity/ad-prefs/ConsentBox";

import fastdom from "lib/fastdom-promise";
import { getAdConsentState, setAdConsentState, getAllAdConsentsWithState } from "common/modules/commercial/ad-prefs.lib";
import { AdConsent, AdConsentWithState } from "common/modules/commercial/ad-prefs.lib";

type AdPrefsWrapperProps = {
  getAdConsentState: (consent: AdConsent) => boolean | null | undefined;
  setAdConsentState: (consent: AdConsent, state: boolean) => void;
  initialConsentsWithState: AdConsentWithState[];
};

const rootSelector: string = '.js-manage-account__ad-prefs';

class AdPrefsWrapper extends Component<AdPrefsWrapperProps, {
  consentsWithState: AdConsentWithState[];
  changesPending: boolean;
  flashing: boolean;
}> {

  constructor(props: AdPrefsWrapperProps): void {
    super(props);
    this.state = {
      changesPending: false,
      flashing: false,
      consentsWithState: [...this.props.initialConsentsWithState]
    };
  }

  onUpdate(consentId: number, state: boolean | null | undefined): void {
    const consentsWithState = [...this.state.consentsWithState];
    const changesPending = this.props.getAdConsentState(consentsWithState[consentId].consent) !== state;
    consentsWithState[consentId].state = state;
    if (this.SubmitButtonRef) {
      this.SubmitButtonRef.scrollIntoView(false);
    }
    this.setState({
      consentsWithState,
      changesPending,
      flashing: false
    });
  }

  onSubmit(event: React.SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    this.state.consentsWithState.forEach(consentWithState => {
      if (typeof consentWithState.state === 'boolean') {
        this.props.setAdConsentState(consentWithState.consent, consentWithState.state);
      }
    });
    this.setState({
      changesPending: false,
      flashing: true
    });
  }

  FeedbackFlashBoxRef: FeedbackFlashBox | null | undefined;
  SubmitButtonRef: HTMLElement | null | undefined;

  render() {
    return <form className="identity-ad-prefs-manager" onSubmit={ev => this.onSubmit(ev)}>
                <div>
                    {this.state.consentsWithState.map((consentWithState, index) => <ConsentBox consent={consentWithState.consent} state={consentWithState.state} key={consentWithState.consent.cookie} onUpdate={(state: boolean | null | undefined) => {
          this.onUpdate(index, state);
        }} />)}
                </div>
                <div className="identity-ad-prefs-manager__footer" ref={child => {
        this.SubmitButtonRef = child;
      }}>
                    <button disabled={this.state.changesPending ? null : 'disabled'} className="manage-account__button manage-account__button--center" data-link-name="ad-prefs : submit" type="submit">
                        Save my settings
                    </button>
                    <FeedbackFlashBox flashing={this.state.flashing}>
                        Your settings have been saved.
                    </FeedbackFlashBox>
                </div>
            </form>;
  }
}

const enhanceAdPrefs = (): void => {
  fastdom.read(() => Array.from(document.querySelectorAll(rootSelector))).then((wrapperEls: HTMLElement[]) => {
    wrapperEls.forEach(_ => {
      fastdom.write(() => {
        render(<AdPrefsWrapper initialConsentsWithState={getAllAdConsentsWithState()} getAdConsentState={getAdConsentState} setAdConsentState={setAdConsentState} />, _);
      });
    });
  });
};

export { enhanceAdPrefs };