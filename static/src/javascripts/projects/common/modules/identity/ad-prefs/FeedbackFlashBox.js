// @flow
import React, { Component } from 'react';

type FeedbackFlashBoxProps = {
    children?: any,
};

class FeedbackFlashBox extends Component<
    FeedbackFlashBoxProps,
    {
        flashing: boolean,
    }
> {
    constructor(props: FeedbackFlashBoxProps): void {
        super(props);
        this.state = {
            flashing: false,
        };
    }

    flash(): void {
        this.setState({ flashing: true });
        setTimeout(() => {
            this.setState({ flashing: false });
        }, 500);
    }

    render() {
        return (
            <div
                className="identity-ad-prefs-manager__flash"
                style={{
                    display: this.state.flashing ? 'block' : 'none',
                }}>
                {this.props.children}
            </div>
        );
    }
}

export { FeedbackFlashBox };
