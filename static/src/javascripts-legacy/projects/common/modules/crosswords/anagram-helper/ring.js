define([
    'react/addons',
    'lodash/collections/map'
], function (
    React,
    map
) {
    var round = function (x) {
        return Math.round(x * 100) / 100;
    };
    var Ring = React.createClass({
        /**
         * Get coordinates for a letter as percentages.
         *
         * To get the diameter:
         *   (width of .crossword__anagram-helper-shuffler) - (2 * desired padding)
         *
         * @param  {Number} angle   angle of letters on the circle
         * @param  {Number} i       letter index
         * @return {Object}         with 'left' and 'top' properties in percent
         */
        getPosition: function (angle, i) {
            var diameter = 40;
            var theta = (angle * Math.PI / 180) * i;

            return {
                left: diameter + round(diameter * Math.sin(theta)) + '%',
                top: diameter + round(diameter * Math.cos(theta)) + '%'
            };
        },

        render: function () {
            var angle = 360 / this.props.letters.length;

            return React.createElement(
                'div', {
                    className: 'crossword__anagram-helper-shuffler'
                },
                map(this.props.letters, (function (letter, i) {
                    return React.createElement(
                        'div', {
                            className: 'crossword__anagram-helper-shuffler__letter ' + (letter.entered ? 'entered' : ''),
                            style: this.getPosition(angle, i),
                            key: i
                        }, letter.value
                    );
                }), this)
            );
        }
    });

    return Ring;
});
