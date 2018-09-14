// @flow
import React, { Component } from 'preact-compat';

type BlockProps = {
    title: string,
    subtitle: ?string,
    children: any,
};

export class Block extends Component<BlockProps> {
    render() {
        const { title, subtitle, children } = this.props;
        return (
            <section className="identity-upsell-block">
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
