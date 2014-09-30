define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var classSet = React.addons.classSet;

    var Cell = React.createClass({
        render: function () {
            var classes = classSet({
                'crossword__grid__cell': true,
                'crossword__grid__cell--highlighted': this.props.isHighlighted,
                'crossword__grid__cell--editable': this.props.isEditable
            });

            var innerNodes = [];

            if (this.props.number !== undefined) {
                innerNodes.push(
                    React.DOM.span({
                        className: 'crossword__grid__cell__number'
                    }, this.props.number)
                );
            }

            if (this.props.isEditable) {
                innerNodes.push(
                    React.DOM.input({
                        type: 'text',
                        className: 'crossword__grid__cell__input'
                    })
                );
            }

            return React.DOM.td({
                className: classes
            }, innerNodes);
        }
    });

    return React.createClass({
        render: function () {
            var that = this;

            var rows = _.map(_.range(this.props.rows), function (y) {
                var innerNodes = _.map(_.range(that.props.columns), function (x) {
                    return Cell(that.props.cells[x][y]);
                });

                return React.DOM.tr({
                    className: 'crossword__grid__row'
                }, innerNodes);
            });

            return React.DOM.table({
                className: 'crossword__grid'
            }, rows);
        }
    });
});
