// @flow
import React from 'preact-compat';

export type CheckboxHtmlProps = {
    checked: ?boolean,
    onChange: (ev: Event) => void,
};

export type CheckboxProps = {
    title: string,
    subtitle: ?string,
    checkboxHtmlProps: CheckboxHtmlProps,
};

const Checkbox = (props: CheckboxProps) => {
    const { title, subtitle } = props;
    return (
        <label className="identity-upsell-checkbox" htmlFor={title}>
            <span className="identity-upsell-checkbox__title">{title}</span>
                {subtitle && <span>{subtitle}</span>}
                <input
                    type="checkbox"
                    id={title}
                    {...props.checkboxHtmlProps}
                />
            <span className="identity-upsell-checkbox__checkmark">
                <span className="identity-upsell-checkbox__checkmark_tick" />
            </span>
        </label>
    );
}


export { Checkbox };
