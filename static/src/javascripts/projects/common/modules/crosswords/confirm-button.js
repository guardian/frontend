define([
    'react',
    'classnames',
    'lodash/objects/assign'
], function (
    React,
    classNames,
    assign) {
    var ConfirmButton = React.createClass({
        getInitialState: function () {
            this.timeout = this.props.timeout || 2000;
            return {
                confirming: false
            };
        },

        confirm: function () {
            if (this.state.confirming) {
                this.setState({
                    confirming: false
                });
                this.props.onClick();
            } else {
                this.setState({
                    confirming: true
                });
                setTimeout(function () {
                    this.setState({
                        confirming: false
                    });
                }.bind(this), this.timeout);
            }
        },

        render: function () {
            var inner = this.state.confirming ?
                'Confirm ' + this.props.text.toLowerCase() : this.props.text;

            var classes = {};
            var className = classNames((
                classes['crossword__controls__button--confirm'] = this.state.confirming,
                classes[this.props.className] = true,
                classes
            ));

            return React.createElement(
                'button',
                assign({}, this.props, {
                    onClick: this.confirm,
                    className: className
                }, this),
                inner
            );
        }
    });

    return ConfirmButton;
});
