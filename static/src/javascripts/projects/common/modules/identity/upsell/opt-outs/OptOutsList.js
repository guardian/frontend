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
    }
> {
    constructor(props: {}) {
        super(props);
        this.state = {
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
            });
        }
    };

    render() {
        return (
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
        );
    }
}
