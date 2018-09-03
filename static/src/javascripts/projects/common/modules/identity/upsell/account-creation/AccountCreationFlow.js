// @flow
import React, { Component } from 'preact-compat';
import {AccountCreationForm} from "./AccountCreationForm";

type AccountCreationFlowProps = {
    csrfToken: string,
    returnUrl: string,
    accountToken: string,
};


type AccountCreationFeaturesProps = {
    returnUrl: string,
};

class AccountCreationFeatures extends Component<AccountCreationFeaturesProps> {
    render() {
        return (
            <div>
                <hr className="manage-account-small-divider" />
                <h1 className={'identity-upsell-title'}>
                    <h1 className={'identity-upsell-title__title'}>
                        Thanks for creating a Guardian account!
                    </h1>
                    <p className={'identity-upsell-title__subtitle'}>>
                        You are now signed in. Start exploring your benefits
                        from our home page.
                    </p>
                </h1>
                <div className="identity-forms-message__body">
                </div>
                <div className="identity-forms-message__body">
                    <a
                        className="manage-account__button manage-account__button--main"
                        data-link-name="complete-consents : cta-bottom"
                        href={this.props.returnUrl}>
                        Go to The Guardian
                    </a>
                </div>
            </div>
        );
    }
}

class AccountCreationFlow extends Component<
    AccountCreationFlowProps,
    {
        hasCreatedAccount?: boolean,
    }
> {
    onAccountCreated = () => {
        this.setState({
            hasCreatedAccount: true,
        });
    };

    render() {
        return !this.state.hasCreatedAccount ? (
            <AccountCreationForm
                csrfToken={this.props.csrfToken}
                accountToken={this.props.accountToken}
                returnUrl={this.props.returnUrl}
                onAccountCreated={this.onAccountCreated}
            />
        ) : (
            <AccountCreationFeatures returnUrl={this.props.returnUrl} />
        );
    }
}

export { AccountCreationFlow };
