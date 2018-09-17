// @flow
import React, { Component } from 'preact-compat';

type CheckboxHtmlProps = {
    checked: ?boolean,
    onChange: (ev: Event) => void,
};

type CheckboxProps = {
    title: string,
    subtitle: ?string,
    checkboxHtmlProps: CheckboxHtmlProps,
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
                    id={title}
                    {...this.props.checkboxHtmlProps}
                />
                <span className="identity-upsell-checkbox__checkmark">
                    <span className="identity-upsell-checkbox__checkmark_tick" />
                </span>
            </label>
        );
    }
}
