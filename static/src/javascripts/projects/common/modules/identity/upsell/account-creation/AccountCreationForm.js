// @flow
import React, { Component } from 'preact-compat';

type AccountCreationFormProps = {
    csrfToken: string,
    accountToken: string,
    userEmail: string,
};

class AccountCreationForm extends Component<
    AccountCreationFormProps,
    {
        password: string,
    }
> {
    constructor(props: AccountCreationFormProps): void {
        super(props);
    }

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        alert(`oh cool thanks is that ${this.state.password}`);
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
                            <label className="label" htmlFor="email">
                                Email
                            </label>
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
                        </li>

                        <li className="form-field" id="password_field">
                            <label className="label" htmlFor="password">
                                Password
                            </label>
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
                                    spellCheck="false"
                                    aria-required="true"
                                />
                            </div>
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

export { AccountCreationForm };
