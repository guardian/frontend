// @flow
import React, { Component } from 'preact-compat';

type BlockProps = {
    title: string,
    subtitle: ?string,
    sideBySide: ?boolean,
    sideBySideBackwards: ?boolean,
    children: any,
};

export class Block extends Component<BlockProps> {
    render() {
        const {
            title,
            subtitle,
            children,
            sideBySide,
            sideBySideBackwards,
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
                <div className="identity-upsell-title">
                    <h2 className="identity-upsell-title__title">{title}</h2>
                    {subtitle && (
                        <h3 className="identity-upsell-title__subtitle">
                            {subtitle}
                        </h3>
                    )}
                </div>
                <div className="identity-upsell-block__container">
                    {children}
                </div>
            </section>
        );
    }
}
