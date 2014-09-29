define([
    'common/utils/$',
    'react'
], function (
    $,
    React
) {
    var Crossword = React.createClass({
        getInitialState: function () {
            return {
                data: this.props.data
            };
        },

        render: function () {
            return React.DOM.p(null, this.state.data.name);
        }
    });

    return function () {
        $('.js-crossword').each(function (element) {
            if (element.hasAttribute('data-crossword-data')) {
                var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
                React.renderComponent(new Crossword({data: crosswordData}), element);
            } else {
                console.warn("JavaScript crossword without associated data", element);
            }
        });
    };
});
