// @flow
import React, { Component } from 'preact-compat';
import arrowRight from 'svgs/icon/arrow-right.svg';

type AccountCreationFlowProps = {
    csrfToken: string,
    accountToken: string,
    userEmail: string,
};

type AccountCreationFormProps = {
    csrfToken: string,
    accountToken: string,
    userEmail: string,
    onAccountCreated: () => {},
};

class AccountCreationFeatures extends Component<> {
    render() {
        return (
            <div>
                Thanks!!
                <a
                    className="manage-account__button manage-account__button--main"
                    data-link-name="complete-consents : cta-bottom"
                    href="http://theguardian.com">
                    Go to The Guardian
                    <div dangerouslySetInnerHTML={arrowRight.markup} />
                </a>
            </div>
        );
    }
}

class AccountCreationForm extends Component<
    AccountCreationFormProps,
    {
        password: string,
    }
> {
    onSubmit = (ev: Event) => {
        ev.preventDefault();
        console.log({
            csrfToken: this.props.csrfToken,
            accountToken: this.props.accountToken,
        });
        this.props.onAccountCreated();
    };

    handlePasswordChange = (ev: Event) => {
        this.setState({ password: ev.target.value });
    };

    render() {
        return (
            <form className="form" onSubmit={this.onSubmit}>
                <fieldset className="fieldset">
                    <h1 className="identity-title--small">
                        Want even more from the Guardian? Create a free account
                    </h1>
                    <div className="identity-forms-message__body">
                        <p>
                            Create your account by setting a password, and
                            manage your email preferences at any time.
                        </p>
                    </div>
                    <div className="fieldset__fields">
                        <li className="form-field" id="password_field">
                            <label htmlFor="email">
                                <div className="label">Email</div>
                                <div className="input">
                                    <input
                                        className="text-input"
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={this.props.userEmail}
                                        disabled="disabled"
                                    />
                                </div>
                            </label>
                        </li>

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
                                    />
                                </div>
                            </label>
                        </li>

                        <li className="form-field form-field__submit">
                            <button
                                type="submit"
                                className="manage-account__button manage-account__button--center">
                                Set password
                            </button>
                        </li>
                    </div>
                </fieldset>
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
    constructor(props) {
        super(props);
        this.state = {
            hasCreatedAccount: false,
        };
    }

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
                userEmail={this.props.userEmail}
                onAccountCreated={this.onAccountCreated}
            />
        ) : (
            <AccountCreationFeatures />
        );
    }
}

export { AccountCreationFlow };
