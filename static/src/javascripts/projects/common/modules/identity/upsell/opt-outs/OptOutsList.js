// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from 'common/modules/identity/upsell/checkbox/Checkbox';
import { get as getConsents } from 'common/modules/identity/upsell/store/consents';
import { setConsent } from 'common/modules/identity/api';
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
        getConsents().then(consents => {
            this.setState({
                consents: consents.filter(c => c.value.isOptOut),
            });
        });
    }

    onCheckboxChange = (ev: Event, i: number) => {
        if (ev.currentTarget instanceof HTMLInputElement) {
            const clone = [...this.state.consents];
            clone[i].isFollowing = ev.currentTarget.checked;
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
        setConsent(
            this.state.consents.map(c => ({
                consented: c.isFollowing,
                id: c.value.id,
            }))
        );

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
                        {consents.map(({ value, isFollowing }, i) => (
                            <Checkbox
                                title={value.description}
                                key={value.id}
                                checkboxHtmlProps={{
                                    checked: isFollowing,
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
