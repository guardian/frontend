// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from 'common/modules/identity/upsell/checkbox/Checkbox';
import {
    getAllUserConsents,
    setConsentsInApi,
} from 'common/modules/identity/upsell/store/consents';
import type { ConsentWithState } from 'common/modules/identity/upsell/store/types';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';

export class OptOutsList extends Component<
    {},
    {
        consents: ConsentWithState[],
        isLoading: boolean,
        hasUnsavedChanges: boolean,
        errors: string[],
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            isLoading: false,
            errors: [],
            hasUnsavedChanges: true,
            consents: [],
        };
    }

    componentDidMount() {
        getAllUserConsents().then(consents => {
            this.setState({
                consents: consents.filter(c => c.consent.isOptOut),
            });
        });
    }

    onCheckboxChange = (consent: ConsentWithState) => {
        this.setState(state => ({
            hasUnsavedChanges: true,
            consents: state.consents.map(
                original =>
                    original.uniqueId === consent.uniqueId ? consent : original
            ),
        }));
    };

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            errors: [],
        });
        setConsentsInApi(this.state.consents)
            .then(() => {
                this.setState({
                    hasUnsavedChanges: false,
                    isLoading: false,
                });
            })
            .catch(() => {
                this.setState({
                    errors: [genericErrorStr],
                    isLoading: false,
                });
            });
    };

    render() {
        const { hasUnsavedChanges, isLoading, consents, errors } = this.state;
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <ul className="identity-forms-fields">
                    <ErrorBar errors={errors} tagName="li" />
                    <li>
                        {consents.map(consent => (
                            <Checkbox
                                title={consent.consent.description}
                                key={consent.uniqueId}
                                checkboxHtmlProps={{
                                    checked: consent.hasConsented,
                                    onChange: ev => {
                                        consent.setState(
                                            ev.currentTarget.checked
                                        );
                                        this.onCheckboxChange(consent);
                                    },
                                }}
                            />
                        ))}
                    </li>
                    <li>
                        <div className="identity-upsell-button-with-proxy">
                            <button
                                data-link-name="upsell-consent : submit optouts"
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
