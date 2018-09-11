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
            <section>
                <h2>{title}</h2>
                {subtitle && <h3>{subtitle}</h3>}
                <div>{children}</div>
            </section>
        );
    }
}
