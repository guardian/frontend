define([
    'common/utils/$',
    'bonzo',
    'bean',
    'lodash/functions/debounce'
], function (
    $,
    bonzo,
    bean,
    debounce
) {
    function initialise() {
        $('.browser-table').each(function () {
            var node  = $(this),
                rows  = this.querySelectorAll('tbody tr'),
                total = node.data('total');

            // Format large numbers
            bonzo(this.querySelectorAll('.format-number')).each(function () {
                var value  = this.getAttribute('data-value'),
                    perc   = (value / total * 100).toFixed(2),
                    output = numberWithCommas(value)
                        + ' <span class="perc">' + perc + '%</span>';

                this.innerHTML = output;
            });

            // Do basic filtering on the table
            bean.on(this.querySelector('.search-query'), 'keyup', debounce(function () {
                var filter = new RegExp(this.value, 'i'),
                    filteredTotal = 0;

                bonzo(rows).each(function () {
                    var rowValue = this.children[1].innerHTML.toLowerCase();

                    if (filter.test(rowValue)) {
                        this.style.display = 'table-row';
                        filteredTotal += parseInt(this.children[2].getAttribute('data-value'), 10);
                    } else {
                        this.style.display = 'none';
                    }
                });

                // Update total
                var totalOutput = numberWithCommas(filteredTotal)
                    + ' <span class="perc">' + (filteredTotal / total * 100).toFixed(2) + '%</span>';
                bonzo(this.querySelector('.total')).html(totalOutput);
            }, 250));
        });
    }

    function numberWithCommas(x) {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) {
            x = x.replace(pattern, '$1,$2');
        }
        return x;
    }

    return {
        init: initialise
    };

});
