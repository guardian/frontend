define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'react'
], function (
    $,
    _,
    config,
    React
    ) {

    return function() {
        var summary = JSON.parse(localStorage.getItem('gu.history.summary'));

        var SummaryTags = React.createClass({
            getInitialState: function() {
                return {summary: this.props.summary};
            },
            handleRemove: function(n) {
                delete this.state.summary.value.tags[n];
                localStorage.setItem('gu.history.summary', JSON.stringify(this.state.summary));
                this.forceUpdate();
            },
            render: function() {
                var self = this,
                    tags = this.state.summary.value.tags;

                return React.DOM.div({},
                    Object.keys(tags).reduce(function(obj, n) {
                        obj[n] = React.DOM.span({className: 'button button--small button--tag button--secondary'},
                            React.DOM.text(null, tags[n][0]),
                            React.DOM.button({onClick: self.handleRemove.bind(self, n)}, 'X')
                        );
                        return obj;
                    }, {})
                );
            }
        });

        React.renderComponent(React.createElement(SummaryTags, {summary: summary}), document.getElementById('preferences-history-tags'));
    };
});
