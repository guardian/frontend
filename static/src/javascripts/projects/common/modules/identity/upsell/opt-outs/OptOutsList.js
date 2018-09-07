// @flow
import React, { Component } from 'preact-compat';
import { Checkbox } from '../checkbox/Checkbox';

type OptOut = {
    id: string,
    title: string,
    checked: boolean,
};

export class OptOutsList extends Component<
    {},
    {
        optouts: OptOut[],
        isLoading: boolean,
        hasUnsavedChanges: boolean
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
            loading: false,
            hasUnsavedChanges: true,
            optouts: [
                {
                    id: 'phone',
                    title:
                        'I do NOT wish to receive communications from the Guardian by telephone.',
                    checked: false,
                },
                {
                    id: 'mail',
                    title: 'I do not want to be contacted by mail',
                    checked: true,
                },
                {
                    id: 'sms',
                    title: 'I do not want to be contacted by SMS',
                    checked: false,
                },
            ],
        };
    }

    onCheckboxChange = (ev: Event, i: number) => {
        if (ev.currentTarget instanceof HTMLInputElement) {
            const optoutsClone = [...this.state.optouts];
            optoutsClone[i].checked = ev.currentTarget.checked;
            this.setState({
                optouts: optoutsClone,
                hasUnsavedChanges: true,
            });
        }
    };

    updateChangesRemotely = (): Promise<void> =>new Promise((yay,nay)=>{
        setTimeout(()=>{
            yay();
        },1000);
    })

    onSubmit = (ev: Event) => {
        ev.preventDefault();
        this.setState({
            isLoading: true,
            hasUnsavedChanges: false,
        });
        this.updateChangesRemotely().then(()=>{
            this.setState({
                isLoading: false,
            });
        }).catch(()=>{
            alert('oops');
        })
        console.table(this.state.optouts);
    }

    render() {
        const {hasUnsavedChanges, isLoading} = this.state;
        return (
            <form onSubmit={ev => this.onSubmit(ev)}>
                <div>
                    {this.state.optouts.map(({ title, checked, id }, i) => (
                        <Checkbox
                            title={title}
                            key={id}
                            checkboxHtmlProps={{
                                checked,
                                onChange: ev => this.onCheckboxChange(ev, i),
                            }}
                        />
                    ))}
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
