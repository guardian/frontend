// @flow
import React from 'preact-compat';

type CheckboxHtmlProps = {
    checked: ?boolean,
    onChange: (ev: Event) => void,
};

type CheckboxProps = {
    title: string,
    key: string,
    checkboxHtmlProps: CheckboxHtmlProps,
};

const Checkbox = ({ title, key, checkboxHtmlProps }: CheckboxProps) => (
    <label
        data-link-name={`upsell-consent : checkbox : ${key} : ${
            checkboxHtmlProps.checked ? 'untick' : 'tick'
        }`}
        className="identity-upsell-checkbox"
        htmlFor={key}>
        <span className="identity-upsell-checkbox__title">{title}</span>
        <input type="checkbox" id={key} {...checkboxHtmlProps} />
        <span className="identity-upsell-checkbox__checkmark">
            <span className="identity-upsell-checkbox__checkmark_tick" />
        </span>
    </label>
);

export { Checkbox };
