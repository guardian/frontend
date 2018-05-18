// @flow
import React, { Component } from 'react';

type BoopableBoxProps = {
    children?: any,
};

class BoopableBox extends Component<
    BoopableBoxProps,
    {
        booping: boolean,
    }
> {
    constructor(props: BoopableBoxProps) {
        super(props);
        this.state = {
            booping: false,
        };
    }

    boop() {
        this.setState({ booping: true });
        setTimeout(() => {
            this.setState({ booping: false });
        }, 500);
    }

    render() {
        return (
            <div
                className="identity-ad-prefs-manager__boop"
                style={{
                    display: this.state.booping ? 'block' : 'none',
                }}>
                {this.props.children}
            </div>
        );
    }
}

export { BoopableBox };
