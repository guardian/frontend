import React from 'preact-compat';



const Checkbox = ({ title, uniqueId, checkboxHtmlProps }) => (
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
