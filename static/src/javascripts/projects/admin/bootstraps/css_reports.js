define([
    'react',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax'
], function (
    React,
    $,
    _,
    ajax
) {
    var indexItem = React.createClass({

    });

    var index = React.createClass({
        render: function () {
            var items = _.map(this.props.days, function (day) {
                return React.DOM.p(null,
                    React.DOM.a({
                        href: "#"
                    })
                )
            });


        }
    });

    function getIndex() {
        return ajax({
            url: '/css-reports.json',
            type: 'json'
        });
    }

    function getReport(key) {
        return ajax({
            url: '/css-reports/' + key + '.json',
            type: 'json'
        });
    }

    function init() {
        var $container = $('.js-css-reports');


    }

    init();
});
