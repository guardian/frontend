// @flow
import React, { Component } from 'preact-compat';
import {AccountCreationForm} from "./AccountCreationForm";
import {AccountCreationFeatures} from "./AccountCreationFeatures";

type AccountCreationFlowProps = {
    csrfToken: string,
    returnUrl: string,
    accountToken: string,
};


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
