// @flow
import React, { Component } from 'preact-compat';
import arrowRight from 'svgs/icon/arrow-right.svg';
import reqwest from 'reqwest';

type AccountCreationFlowProps = {
    csrfToken: string,
    returnUrl: string,
    accountToken: string,
};

type AccountCreationFormProps = {
    csrfToken: string,
    accountToken: string,
    returnUrl: string,
    onAccountCreated: () => {},
};

type AccountCreationFeaturesProps = {
    returnUrl: string,
};

class AccountCreationFeatures extends Component<AccountCreationFeaturesProps> {
    render() {
        return (
            <div>
                <hr className="manage-account-small-divider" />
                <h1 className="identity-title--small">
                    Thanks for creating a Guardian account!
                </h1>
                <div className="identity-forms-message__body">
                    <p>
                        You are now signed in. Start exploring your benefits
                        from our home page.
                    </p>
                </div>
                <div className="identity-forms-message__body">
                    <a
                        className="manage-account__button manage-account__button--icon manage-account__button--main"
                        data-link-name="complete-consents : cta-bottom"
                        href={this.props.returnUrl}>
                        Go to The Guardian
                        <span
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: arrowRight.markup,
                            }}
                        />
                    </a>
                </div>
            </div>
        );
    }
}

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
        const { isError, errorReason } = this.state;
        return (
            <form className="form" onSubmit={this.onSubmit}>
                <hr className="manage-account-small-divider" />
                {isError && (
                    <div className="form__error">
                        {errorReason || 'Oops. Something went wrong'}
                    </div>
                )}
                <h1 className="identity-title--small">
                    Want even more from the Guardian? Create a free account
                </h1>
                <div className="identity-forms-message__body">
                    <p>
                        Create your account by setting a password, and manage
                        your email preferences at any time.
                    </p>
                </div>
                <div className="fieldset__fields">
                    <ul>
                        <li className="form-field" id="password_field">
                            <label htmlFor="password">
                                <div className="label">Password</div>
                                <div className="input">
                                    <input
                                        className="text-input"
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
                                </div>
                            </label>
                        </li>

                        <li className="form-field form-field__submit">
                            {this.state.isLoading ? (
                                <button
                                    disabled
                                    className="manage-account__button manage-account__button--light manage-account__button--center">
                                    Hang on...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="manage-account__button manage-account__button--icon manage-account__button--main">
                                    Set password{' '}
                                    <span
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{
                                            __html: arrowRight.markup,
                                        }}
                                    />
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
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

class AccountCreationFlow extends Component<
    AccountCreationFlowProps,
    {
        hasCreatedAccount: boolean,
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
