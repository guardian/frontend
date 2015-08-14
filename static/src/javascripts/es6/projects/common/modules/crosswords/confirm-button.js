import React from 'react';

export default class ConfirmButton extends React.Component {
    constructor (props) {
        super(props);
        this.timeout = this.props.timeout || 2000;
        this.state = { confirming: false };
    }

    confirm () {
        if (this.state.confirming) {
            this.setState({ confirming: false });
            this.props.onClick();
        } else {
            this.setState({ confirming: true });
            setTimeout(() => this.setState({ confirming: false }), this.timeout);
        }
    }

    render () {
        const inner = this.state.confirming ?
            'Confirm ' + this.props.text.toLowerCase() : this.props.text;

        return (
            <button {...this.props} onClick={this.confirm.bind(this)}>
                {inner}
            </button>
        );
    }
}
