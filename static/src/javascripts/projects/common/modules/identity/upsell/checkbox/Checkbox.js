// @flow
import React, { Component } from 'preact-compat';

type CheckboxProps = {
    title: string,
    subtitle: ?string,
    checked: ?boolean,
    onChange: ?(ev: Event) => void,
};

export class Checkbox extends Component<CheckboxProps, { checked: boolean }> {
    render() {
        const { title, subtitle } = this.props;
        return (
            <label className="identity-upsell-checkbox" htmlFor={title}>
                <span className="identity-upsell-checkbox__title">{title}</span>
                {subtitle && <span>{subtitle}</span>}
                <input
                    type="checkbox"
                    checked={this.props.checked}
                    onChange={this.props.onChange}
                    id={title}
                />
                <span className="identity-upsell-checkbox__checkmark">
                    <span className="identity-upsell-checkbox__checkmark_tick" />
                </span>
            </label>
        );
    }
}
