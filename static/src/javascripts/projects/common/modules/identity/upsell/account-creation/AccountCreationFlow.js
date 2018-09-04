// @flow
import React, { Component } from 'preact-compat';
import { AccountCreationForm } from './AccountCreationForm';
import { AccountCreationFeatures } from './AccountCreationFeatures';

type AccountCreationFlowProps = {
    csrfToken: string,
    returnUrl: string,
    accountToken: string,
    email: string,
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
        return this.state.hasCreatedAccount ? (
            <AccountCreationForm
                email={this.props.email}
                csrfToken={this.props.csrfToken}
                accountToken={this.props.accountToken}
                onAccountCreated={this.onAccountCreated}
            />
        ) : (
            <AccountCreationFeatures returnUrl={this.props.returnUrl} />
        );
    }
}

export { AccountCreationFlow };
