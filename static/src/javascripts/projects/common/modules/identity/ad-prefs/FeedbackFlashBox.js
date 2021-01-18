import React, { Component } from 'preact-compat';


class FeedbackFlashBox extends Component {
    render() {
        return (
            <div
                className={[
                    'identity-ad-prefs-manager__flash',
                    this.props.flashing
                        ? 'identity-ad-prefs-manager__flash--flashing'
                        : '',
                ].join(' ')}
                aria-hidden="true">
                {this.props.children}
            </div>
        );
    }
}

export { FeedbackFlashBox };
