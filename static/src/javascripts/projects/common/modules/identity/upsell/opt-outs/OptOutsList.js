// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from '../checkbox/Checkbox';
import { get as getConsents, updateRemotely } from '../store/consents';
import type {Consent} from "../store/consents";

export class OptOutsList extends Component<
    {},
    {
        consents: Consent[],
        isLoading: boolean,
        hasUnsavedChanges: boolean
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            loading: false,
            hasUnsavedChanges: true,
            consents: [],
        };
    }

    componentDidMount() {
        getConsents().then(consents=>{
            this.setState({
                consents: consents.filter(c=>c.isOptOut),
            });
            console.log(consents);
        })
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

    updateChangesRemotely = (): Promise<void> =>
        Promise.all(this.state.consents.map(c=>updateRemotely(c.hasConsented,c.id))
    );

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
        });
        this.updateChangesRemotely().then(()=>{
            this.setState({
                isLoading: false,
                hasUnsavedChanges: false,
            });
        }).catch(()=>{
            alert('oops');
        })
        console.table(this.state.consents);
    }

    render() {
        const {hasUnsavedChanges, isLoading, consents} = this.state;
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <div>
                    {consents.map(({ description, hasConsented, id }, i) => {
                            return (
                            <Checkbox
                                title={description}
                                key={id}
                                checkboxHtmlProps={{
                                    checked: hasConsented,
                                    onChange: ev => this.onCheckboxChange(ev, i),
                                }}
                            />)
                        }
                        )
                    }
                </div>
                <div class={'identity-upsell-button-with-proxy'}>
                    <button
                        type={"submit"}
                        disabled={isLoading}
                        className={"manage-account__button manage-account__button--main"}
                    >
                        Save changes
                    </button>
                    {!hasUnsavedChanges &&
                        <span class={'identity-upsell-button-with-proxy__proxy identity-upsell-button-with-proxy__proxy--success'}>Changes saved</span>
                    }
                    {isLoading &&
                        <span class={'identity-upsell-button-with-proxy__proxy'}>Loading</span>
                    }
                </div>
            </form>
        );
    }
}
