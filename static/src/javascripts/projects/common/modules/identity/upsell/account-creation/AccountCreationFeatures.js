import React, { Component } from 'preact-compat';
import { AccountActionableBenefits } from './AccountBenefits';

export class AccountCreationFeatures extends Component {
    render() {
        return (
            <div>
                <header className="identity-upsell-title">
                    <h1 className="identity-upsell-title__title">
                        Your account has been created.
                    </h1>
                    <p className="identity-upsell-title__subtitle">
                        Start exploring your benefits:
                    </p>
                </header>
                <div className="identity-forms-message__body">
                    <AccountActionableBenefits />
                </div>
            </div>
        );
    }
}
