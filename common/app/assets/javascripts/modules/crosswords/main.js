define([
    'common/utils/$',
    'common/utils/_',
    'react',
    'common/modules/crosswords/clues',
    'common/modules/crosswords/grid'
], function (
    $,
    _,
    React,
    Clues,
    Grid
) {
    var Crossword = React.createClass({
        getInitialState: function () {
            return {
                data: this.props.data
            };
        },

        render: function () {
            return React.DOM.div(null,
                Clues({
                    clues: this.state.data.entries
                })
            );
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
