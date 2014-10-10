define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var classSet = React.addons.classSet,
        Cell = React.createClass({
            render: function () {
                var innerNodes = [],
                    props = {
                        className: classSet({
                            'crossword__grid__cell': true,
                            'crossword__grid__cell--focussed': this.props.isFocussed,
                            'crossword__grid__cell--highlighted': this.props.isHighlighted,
                            'crossword__grid__cell--editable': this.props.isEditable,
                            'crossword__grid__cell--non-editable': !this.props.isEditable
                        })
                    };

                if (this.props.number !== undefined) {
                    innerNodes.push(
                        React.DOM.span({
                            key: 'number',
                            className: 'crossword__grid__cell__number'
                        }, this.props.number)
                    );
                }

                if (this.props.value !== undefined) {
                    innerNodes.push(React.DOM.span({
                        key: 'entry',
                        className: 'crossword__grid__cell__entry'
                    }, this.props.value));
                }

                if (this.props.isEditable) {
                    props.onClick = this.props.handleSelect;
                }

                return React.DOM.td(props, innerNodes);
            }
        });

    return React.createClass({
        handleSelect: function (x, y, pageX, pageY) {
            this.props.onSelect(x, y, pageX, pageY);
        },

        render: function () {
            var that = this,
                rows = _.map(_.range(this.props.rows), function (y) {
                    var innerNodes = _.map(_.range(that.props.columns), function (x) {
                        var cellProps = that.props.cells[x][y];
                        cellProps.handleSelect = that.handleSelect.bind(that, x, y);
                        cellProps.key = 'cell_' + x + '_' + y;
                        cellProps.isHighlighted = that.props.isHighlighted(x, y);
                        cellProps.isFocussed = that.props.focussedCell && x === that.props.focussedCell.x &&
                            y === that.props.focussedCell.y;
                        return Cell(cellProps);
                    });

                    return React.DOM.tr({
                        key: 'row_' + y,
                        className: 'crossword__grid__row'
                    }, innerNodes);
                });

            return React.DOM.table({
                className: 'crossword__grid'
            }, rows);
        }
    });
});
