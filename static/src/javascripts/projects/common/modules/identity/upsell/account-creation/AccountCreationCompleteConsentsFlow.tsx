
import React, { Component } from "preact-compat";
import { AccountCreationFeatures } from "./AccountCreationFeatures";
import { AccountCreationForm } from "./AccountCreationForm";
import { AccountBenefits } from "./AccountBenefits";

type AccountCreationCompleteConsentsFlowProps = {
  csrfToken: string;
  returnUrl: string;
  accountToken: string;
  email: string;
};

class AccountCreationCompleteConsentsFlow extends Component<AccountCreationCompleteConsentsFlowProps, {
  hasCreatedAccount?: boolean;
}> {

  onAccountCreated = () => {
    this.setState({
      hasCreatedAccount: true
    });
  };

  render() {
    return !this.state.hasCreatedAccount ? <div>
                <hr className="manage-account-small-divider" />
                <div className="form">
                    <h1 className="identity-upsell-title">
                        <h1 className="identity-upsell-title__title">
                            Want more from The Guardian?
                        </h1>
                        <p className="identity-upsell-title__subtitle">
                            Create your account now to manage your preferences
                            and explore your free benefits.
                        </p>
                    </h1>
                    <div>
                        <AccountCreationForm {...this.props} onAccountCreated={this.onAccountCreated} />
                    </div>
                    <aside className="identity-upsell-account-creation-block">
                        <hr className="manage-account-small-divider" />
                        <AccountBenefits />
                    </aside>
                </div>
            </div> : <div>
                <hr className="manage-account-small-divider" />
                <AccountCreationFeatures returnUrl={this.props.returnUrl} />
            </div>;
  }
}

export { AccountCreationCompleteConsentsFlow };