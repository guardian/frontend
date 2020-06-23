// @flow
import React from 'preact/compat';

type CheckboxHtmlProps = {
    checked: ?boolean,
    onChange: (ev: Event) => void,
};

type CheckboxProps = {
    title: string,
    uniqueId: string,
    checkboxHtmlProps: CheckboxHtmlProps,
};

const Checkbox = ({ title, uniqueId, checkboxHtmlProps }: CheckboxProps) => (
    <label
        data-link-name={`upsell-consent : checkbox : ${uniqueId} : ${
            checkboxHtmlProps.checked ? 'untick' : 'tick'
        }`}
        className="identity-upsell-checkbox"
        htmlFor={uniqueId}>
        <span className="identity-upsell-checkbox__title">{title}</span>
        <input type="checkbox" id={uniqueId} {...checkboxHtmlProps} />
        <span className="identity-upsell-checkbox__checkmark">
            <span className="identity-upsell-checkbox__checkmark_tick" />
        </span>
    </label>
);

export { Checkbox };
