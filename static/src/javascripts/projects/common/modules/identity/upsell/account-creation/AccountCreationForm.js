// @flow
import React, { Component } from 'preact-compat';
import { AccountBenefits } from './AccountBenefits';
import {AccountCreationFormFields} from "./AccountCreationFormFields";
import type {AccountCreationFormFieldsProps} from "./AccountCreationFormFields";

class AccountCreationForm extends Component<
    AccountCreationFormFieldsProps
> {

    render() {
        return (
            <div className={'form'}>
                <h1 className="identity-upsell-title">
                    <h1 className="identity-upsell-title__title">
                        Want more from The Guardian?
                    </h1>
                    <p className="identity-upsell-title__subtitle">
                        Create your account now to manage your preferences and
                        explore your free benefits.
                    </p>
                </h1>
                <div>
                    <AccountCreationFormFields {...this.props}/>
                </div>
                <aside className="identity-upsell-account-creation-block">
                    <hr className="manage-account-small-divider" />
                    <AccountBenefits />
                </aside>
            </div>
        );
    }
}

export { AccountCreationForm };
