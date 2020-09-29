
import React, { Component } from "preact-compat";

type FeedbackFlashBoxProps = {
  children: any;
  flashing: boolean;
};

class FeedbackFlashBox extends Component<FeedbackFlashBoxProps> {

  render() {
    return <div className={['identity-ad-prefs-manager__flash', this.props.flashing ? 'identity-ad-prefs-manager__flash--flashing' : ''].join(' ')} aria-hidden="true">
                {this.props.children}
            </div>;
  }
}

export { FeedbackFlashBox };