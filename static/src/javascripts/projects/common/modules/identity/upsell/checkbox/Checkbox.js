// @flow
import React, { Component } from 'preact-compat';

type CheckboxProps = {
    title: string,
    subtitle: ?string,
    preticked: ?boolean,
    onChange: ?(checked:boolean) => void
}

export const Checkbox = ({title, subtitle}) => (
    <label className={'identity-upsell-checkbox'}>
        <span className={'identity-upsell-checkbox__title'}>{title}</span>
        {subtitle &&
            <span>{subtitle}</span>
        }
        <input type={'checkbox'} />
        <span className="identity-upsell-checkbox__checkmark">
            <span className="identity-upsell-checkbox__checkmark_tick"></span>
        </span>
    </label>
);
