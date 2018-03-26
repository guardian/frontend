// @flow
import React, { Component } from 'react/addons';
import { classNames } from 'common/modules/crosswords/classNames';

class ConfirmButton extends Component {
    constructor(props) {
        super(props);
        this.timeout = props.timeout || 2000;
        this.state = {
            confirming: false,
        };
    }

    confirm() {
        if (this.state.confirming) {
            this.setState({
                confirming: false,
            });
            this.props.onClick();
        } else {
            this.setState({
                confirming: true,
            });
            setTimeout(() => {
                this.setState({
                    confirming: false,
                });
            }, this.timeout);
        }
    }

    render() {
        const inner = this.state.confirming
            ? `Confirm ${this.props.text.toLowerCase()}`
            : this.props.text;

        const classes = {};
        const className = classNames(
            ((classes[
                'crossword__controls__button--confirm'
            ] = this.state.confirming),
            (classes[this.props.className] = true),
            classes)
        );
        const props = Object.assign(
            {},
            this.props,
            {
                onClick: this.confirm,
                className,
            },
            this
        );

        return <button {...props}>{inner}</button>;
    }
}

export { ConfirmButton };
