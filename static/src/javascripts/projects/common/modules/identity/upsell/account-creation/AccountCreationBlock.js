// @flow
import React, { Component } from 'preact-compat';
import { AccountCreationFormFields } from './AccountCreationFormFields';
import { AccountActionableBenefits, AccountBenefits } from './AccountBenefits';
import { Block } from '../block/Block';

type AccountCreationBlockProps = {
    csrfToken: string,
    accountToken: string,
    email: string,
};

class AccountCreationBlock extends Component<
    AccountCreationBlockProps,
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
            <Block
                withGrid
                title="Want more from The Guardian?"
                subtitle="Create your account now to manage your preferences and explore your free benefits.">
                <AccountCreationFormFields
                    {...this.props}
                    onAccountCreated={this.onAccountCreated}
                />
                <AccountBenefits />
            </Block>
        ) : (
            <Block title="Start exploring your benefits">
                <AccountActionableBenefits />
            </Block>
        );
    }
}

export { AccountCreationBlock };
