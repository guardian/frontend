import React from 'preact-compat';
import circlesLeft from './circles-left.svg';
import circlesRight from './circles-right.svg';


const Header = ({ title, subtitle }) => (
    <div className="identity-upsell-subheader">
        <div className="identity-upsell-layout identity-upsell-layout--padding">
            <header className="identity-upsell-title identity-upsell-title--hero">
                <h1 className="identity-upsell-title__title">{title}</h1>
                <h1 className="identity-upsell-title__subtitle">{subtitle}</h1>
            </header>
        </div>
        <div className="identity-upsell-subheader__graphics">
            <span
                className="identity-upsell-subheader__graphic identity-upsell-subheader__graphic--circlesLeft"
                dangerouslySetInnerHTML={{ __html: circlesLeft.markup }}
            />
            <span
                className="identity-upsell-subheader__graphic identity-upsell-subheader__graphic--circlesRight"
                dangerouslySetInnerHTML={{ __html: circlesRight.markup }}
            />
        </div>
    </div>
);

export { Header };
