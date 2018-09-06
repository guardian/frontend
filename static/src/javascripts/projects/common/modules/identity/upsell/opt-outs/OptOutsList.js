// @flow
import React, { Component } from 'preact-compat';
import {Checkbox} from "../checkbox/Checkbox";

export class OptOutsList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            optouts: [
                {
                    title: 'I do NOT wish to receive communications from the Guardian by telephone.',
                    checked: false,
                },
                {
                    title: 'I do not want to be contacted by mail',
                    checked: true,
                },
                {
                    title: 'I do not want to be contacted by SMS',
                    checked: false,
                },
            ]
        }
    }

    onCheckboxChange = (ev, i) => {
        const optoutsClone = [...this.state.optouts];
        optoutsClone[i].checked = ev.currentTarget.checked;
        this.setState({
            optouts: optoutsClone
        });
    }

    render() {
        return (
            <div>
                {this.state.optouts.map(({title, checked},i) => (
                    <Checkbox title={title} key={i} checked={checked} onChange={ev => this.onCheckboxChange(ev,i)}/>
                ))}
            </div>
        )
    }
}
