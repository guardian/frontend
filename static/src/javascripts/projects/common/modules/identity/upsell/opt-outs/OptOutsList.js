// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from 'common/modules/identity/upsell/checkbox/Checkbox';
import {
    get as getConsents,
    updateRemotely,
} from 'common/modules/identity/upsell/store/consents';
import type { ConsentType } from 'common/modules/identity/upsell/store/consents';

export class OptOutsList extends Component<
    {},
    {
        consents: ConsentType[],
        isLoading: boolean,
        hasUnsavedChanges: boolean,
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoading: false,
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
        });
        this.updateChangesRemotely().then(() => {
            this.setState({
                isLoading: false,
                hasUnsavedChanges: false,
            });
        });
    };

    updateChangesRemotely = (): Promise<void> =>
        Promise.all(
            this.state.consents.map(c =>
                updateRemotely(c.isFollowing, c.value.id)
            )
        );

    render() {
        const { hasUnsavedChanges, isLoading, consents } = this.state;
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <div>
                    {consents.map(({ value, isFollowing }, i) => (
                        <Checkbox
                            title={value.description}
                            key={value.id}
                            checkboxHtmlProps={{
                                checked: isFollowing,
                                onChange: ev => this.onCheckboxChange(ev, i),
                            }}
                        />
                    ))}
                </div>
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
            </form>
        );
    }
}
