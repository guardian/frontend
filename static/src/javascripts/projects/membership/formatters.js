define([], function () {
    return {
        formatAmount: function (amount) {
            return amount ? '£' + (amount / 100).toFixed(2) : 'FREE';
        },
        formatDate: function (timestamp) {
            var options = {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            };
            return (new Date(timestamp)).toLocaleDateString('en-GB', options);
        }
    };
});
