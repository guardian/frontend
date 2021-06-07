import React, { Component } from 'preact/compat';


export class Block extends Component {
    render() {
        const {
            title,
            subtitle,
            subtext,
            children,
            sideBySide,
            sideBySideBackwards,
            halfWidth,
        } = this.props;
        return (
            <section
                className={[
                    'identity-upsell-block',
                    sideBySide || sideBySideBackwards
                        ? 'identity-upsell-block--side-by-side'
                        : '',
                    sideBySideBackwards
                        ? 'identity-upsell-block--side-by-side identity-upsell-block--side-by-side--backwards'
                        : '',
                ].join(' ')}>
                <div
                    className={
                        halfWidth ? 'identity-upsell-block--half-width' : ''
                    }>
                    <div className="identity-upsell-title">
                        <h2 className="identity-upsell-title__title">
                            {title}
                        </h2>
                        {subtitle && (
                            <h3 className="identity-upsell-title__subtitle">
                                {subtitle}
                            </h3>
                        )}
                        {subtext && (
                            <p className="identity-upsell-title__subtext">
                                {subtext}
                            </p>
                        )}
                    </div>
                    <div className="identity-upsell-block__container">
                        {children}
                    </div>
                </div>
            </section>
        );
    }
}
