define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    /**
     * You can only focus inputs in Mobile Safari when handling a click (touch) event.
     * In order to overcome this limitation, I've used a 'floating' input, so that as a user
     * types it moves either across or down the grid as appropriate depending on what clue
     * the user is currently answering.
     */
    return React.createClass({
        render: function () {
            var inlineStyle = {
                left: this.props.left,
                top: this.props.top
            };

            if (!this.props.isVisible) {
                inlineStyle.display = 'none';
            }

            return React.DOM.input({
                type: 'text',
                maxLength: 1,
                className: 'crossword__floating-input',
                style: inlineStyle,
                value: this.props.value,
                onChange: this.props.onChange
            });
        }
    });
});
