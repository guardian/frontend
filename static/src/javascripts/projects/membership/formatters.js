define([], function () {
    return {
        formatAmount: function (amount) {
            return amount ? '£' + (amount / 100).toFixed(2) : 'FREE';
        },
        formatDate: function (timestamp) {
            var date = new Date(timestamp),
            months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            day = date.getDate(),
            month = months[date.getMonth()],
            year = date.getFullYear();
            return [day, month, year].join(' ');
        }
    };
});
