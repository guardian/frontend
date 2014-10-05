define([
    'common/utils/_',
    'react'
], function (
    _,
    React
) {
    var classSet = React.addons.classSet,
        Cell = React.createClass({
            handleChange: function (event) {
                this.props.handleInput(event.target.value);
            },

            render: function () {
                var classes = classSet({
                    'crossword__grid__cell': true,
                    'crossword__grid__cell--highlighted': this.props.isHighlighted,
                    'crossword__grid__cell--editable': this.props.isEditable,
                    'crossword__grid__cell--non-editable': !this.props.isEditable
                }), innerNodes = [];

                if (this.props.number !== undefined) {
                    innerNodes.push(
                        React.DOM.span({
                            key: 'number',
                            className: 'crossword__grid__cell__number'
                        }, this.props.number)
                    );
                }

                if (this.props.isEditable) {
                    innerNodes.push(
                        React.DOM.input({
                            key: 'input',
                            type: 'text',
                            maxLength: '1',
                            className: 'crossword__grid__cell__input',
                            value: this.props.value,
                            onChange: this.handleChange,
                            onClick: this.props.handleSelect
                        })
                    );
                }

                return React.DOM.td({
                    className: classes
                }, innerNodes);
            }
        });

    return React.createClass({
        handleInput: function (x, y, value) {
            if (value.length > 1) {
                value = value[0];
            }

            this.props.setCellValue(x, y, value.toUpperCase());
        },

        handleSelect: function (x, y) {
            this.props.onSelect(x, y);
        },

        render: function () {
            var that = this,
                rows = _.map(_.range(this.props.rows), function (y) {
                    var innerNodes = _.map(_.range(that.props.columns), function (x) {
                        var cellProps = that.props.cells[x][y];
                        cellProps.handleInput = that.handleInput.bind(that, x, y);
                        cellProps.handleSelect = that.handleSelect.bind(that, x, y);
                        cellProps.key = 'cell_' + x + '_' + y;
                        cellProps.isHighlighted = that.props.isHighlighted(x, y);
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
