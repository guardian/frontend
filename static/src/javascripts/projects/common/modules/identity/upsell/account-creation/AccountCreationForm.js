import React, { Component } from 'preact/compat';
import { fetchJson } from '../../../../../../lib/fetch-json';
import ophan from 'ophan/ng';
import reportError from 'lib/report-error';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';


class AccountCreationForm extends Component {
    constructor(props) {
        super(props);
        this.setState({
            errors: [],
        });
    }

    onSubmit = (ev) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            errors: [],
        });

        const url = '/password/guest';

        const data = new URLSearchParams();
        data.append('csrfToken', this.props.csrfToken);
        data.append('token', this.props.accountToken);
        data.append('password', this.state.password);

        fetch(url, {
            method: 'POST',
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body: data.toString(),
        }).then(response => {
            if(response.ok) {
                ophan.record({
                    component: 'set-password',
                    value: 'set-password',
                });
                this.props.onAccountCreated();
            } else {
                reportError(
                    Error(response),
                    {
                        feature: 'identity-create-account-upsell',
                    },
                    false
                    );
                try {
                    const apiError = JSON.parse(response.responseText)[0];
                    this.setState({
                        errors: [apiError.description],
                    });
                } catch (exception) {
                    this.setState({ errors: [genericErrorStr] });
                }
            }
        }).catch(response => {
            reportError(
                Error(response),
                {
                    feature: 'identity-create-account-upsell',
                },
                false
                );
        }).finally(() => {
            this.setState({ isLoading: false });
        });
    };

    handlePasswordChange = (ev) => {
        if (!(ev.target instanceof HTMLInputElement)) {
            return;
        }
        this.setState({ password: ev.target.value });
    };

    render() {
        const { errors, isLoading } = this.state;
        const { email } = this.props;
        return (
            <form onSubmit={this.onSubmit}>
                <ul className="identity-forms-fields">
                    <ErrorBar tagName="li" errors={errors} />
                    {email && (
                        <li id="email_field" aria-hidden>
                            <label
                                className="identity-forms-input-wrap"
                                htmlFor="email">
                                <div className="identity-forms-label">
                                    Email
                                </div>
                                <input
                                    className="identity-forms-input"
                                    type="email"
                                    id="email"
                                    value={email}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    aria-required="true"
                                    required
                                    disabled
                                />
                            </label>
                        </li>
                    )}
                    <li id="password_field">
                        <label
                            className="identity-forms-input-wrap"
                            htmlFor="password">
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
            </form>
        );
    }
}

export { AccountCreationForm };
