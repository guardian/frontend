define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    /**
     * You can only focus inputs in Mobile Safari when handling a click (touch) event.
     * In order to overcome this limitation, I've used a hidden input.
     */
    return React.createClass({
        render: function () {
            return React.DOM.div({
                css: {
                    overflow: 'hidden',
                    width: 0
                }
            }, React.DOM.input({
                    type: 'text',
                    maxLength: 1,
                    className: 'crossword__hidden-input',
                    style: inlineStyle,
                    value: this.props.value,
                    onChange: this.props.onChange
                }
            ));
        }
    });
});
