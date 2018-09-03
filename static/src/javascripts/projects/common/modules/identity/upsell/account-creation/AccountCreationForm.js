import React, { Component } from 'preact-compat';
import reqwest from 'reqwest';
import ophan from 'ophan/ng';
import {AccountBenefits} from "./AccountBenefits";

type AccountCreationFormProps = {
    csrfToken: string,
    accountToken: string,
    returnUrl: string,
    onAccountCreated: () => {},
};

class AccountCreationForm extends Component<
    AccountCreationFormProps,
    {
        password?: string,
        isLoading?: boolean,
        isError?: boolean,
        errorReason?: string,
    }
    > {
    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            isError: false,
        });

        reqwest({
            url: '/password/guest',
            method: 'post',
            data: {
                csrfToken: this.props.csrfToken,
                token: this.props.accountToken,
                password: this.state.password,
            },
            success: () => {
                ophan.record({
                    component: 'set-password',
                    value: 'set-password',
                });
                this.props.onAccountCreated();
            },
            error: response => {
                try {
                    const apiError = JSON.parse(response.responseText)[0];
                    this.setState({
                        isError: true,
                        errorReason: apiError.description,
                    });
                } catch (exception) {
                    this.setState({ isError: true });
                }
            },
            complete: () => {
                this.setState({ isLoading: false });
            },
        });
    };

    handlePasswordChange = (ev: Event) => {
        if (!(ev.target instanceof HTMLInputElement)) {
            return;
        }
        this.setState({ password: ev.target.value });
    };

    render() {
        const { isError, errorReason, isLoading } = this.state;
        return (
            <form className="form" onSubmit={this.onSubmit}>
                <hr className="manage-account-small-divider" />
                {isError && (
                    <div className="form__error">
                        {errorReason || 'Oops. Something went wrong'}
                    </div>
                )}
                <h1 className={'identity-upsell-title'}>
                    <h1 className={'identity-upsell-title__title'}>
                        Want more from The Guardian?
                    </h1>
                    <p className={'identity-upsell-title__subtitle'}>
                        Create your account now to manage your preferences and explore your free benefits.
                    </p>
                </h1>
                <div>
                    <ul className="identity-forms-fields">
                        <li id="email_field" aria-hidden={true}>
                            <label class="identity-forms-input-wrap" htmlFor="email">
                                <div className="identity-forms-label">Email</div>
                                <input
                                    className="identity-forms-input"
                                    type="email"
                                    id="email"
                                    value={'tester@test.com'}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    aria-required="true"
                                    required
                                    disabled={true}
                                />
                            </label>
                        </li>
                        <li id="password_field">
                            <label class="identity-forms-input-wrap" htmlFor="password">
                                <div className="identity-forms-label">Password</div>
                                <input
                                    className="identity-forms-input"
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={this.state.password}
                                    autoComplete="off"
                                    onChange={this.handlePasswordChange}
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    aria-required="true"
                                    required
                                />
                            </label>
                        </li>
                        <li>
                            {isLoading ? (
                                <button
                                    disabled
                                    className="manage-account__button manage-account__button--light manage-account__button--center">
                                    Hang on...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="manage-account__button manage-account__button--icon manage-account__button--main">
                                    Create an account
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
                <aside className={'identity-upsell-account-creation-block'}>
                    <hr class="manage-account-small-divider" />
                    <AccountBenefits/>
                </aside>
                <aside className="identity-forms-message__body">
                    <hr className="manage-account-small-divider" />
                    <a
                        className="manage-account__button manage-account__button--light"
                        data-link-name="complete-consents : cta-bottom"
                        href={this.props.returnUrl}>
                        Go to The Guardian
                    </a>
                </aside>
            </form>
        );
    }
}

export {AccountCreationForm}
