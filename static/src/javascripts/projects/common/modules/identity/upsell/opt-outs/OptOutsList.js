// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from 'common/modules/identity/upsell/checkbox/Checkbox';
import {
    getUserConsents,
    setConsentsInApi,
} from 'common/modules/identity/upsell/store/consents';
import type { ConsentType } from 'common/modules/identity/upsell/store/consents';

export class OptOutsList extends Component<
    {},
    {
        consents: ConsentType[],
        isLoading: boolean,
        hasUnsavedChanges: boolean,
        hasError: boolean,
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoading: false,
            hasError: false,
            hasUnsavedChanges: true,
            consents: [],
        };
    }

    componentDidMount() {
        getUserConsents().then(consents => {
            this.setState({
                consents: consents.filter(c => c.consent.isOptOut),
            });
        });
    }

    onCheckboxChange = (ev: Event, i: number) => {
        if (ev.currentTarget instanceof HTMLInputElement) {
            const clone = [...this.state.consents];
            clone[i].hasConsented = ev.currentTarget.checked;
            this.setState({
                consents: clone,
                hasUnsavedChanges: true,
            });
        }
    };

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            hasError: false,
        });
        this.updateChangesRemotely()
            .then(() => {
                this.setState({
                    hasUnsavedChanges: false,
                    isLoading: false,
                });
            })
            .catch(() => {
                this.setState({
                    hasError: true,
                    isLoading: false,
                });
            });
    };

    updateChangesRemotely = (): Promise<void> =>
        setConsentsInApi(this.state.consents);

    render() {
        const { hasUnsavedChanges, isLoading, consents, hasError } = this.state;
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <ul className="identity-forms-fields">
                    <li aria-live="polite">
                        {hasError && (
                            <div className="form__error" role="alert">
                                Oops. Something went wrong
                            </div>
                        )}
                    </li>
                    <li>
                        {consents.map(({ consent, hasConsented }, i) => (
                            <Checkbox
                                title={consent.description}
                                key={consent.id}
                                checkboxHtmlProps={{
                                    checked: hasConsented,
                                    onChange: ev =>
                                        this.onCheckboxChange(ev, i),
                                }}
                            />
                        ))}
                    </li>
                    <li>
                        <div className="identity-upsell-button-with-proxy">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="manage-account__button manage-account__button--main">
                                Save changes
                            </button>
                            {!hasUnsavedChanges && (
                                <span className="identity-upsell-button-with-proxy__proxy identity-upsell-button-with-proxy__proxy--success">
                                    Changes saved
                                </span>
                            )}
                            {isLoading && (
                                <span className="identity-upsell-button-with-proxy__proxy">
                                    Loading
                                </span>
                            )}
                        </div>
                    </li>
                </ul>
            </form>
        );
    }
}
