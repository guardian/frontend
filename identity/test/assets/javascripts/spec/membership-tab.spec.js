define(['membership/membership-tab'], function (MembershipTab) {

    describe('Membership Tab Module Tests', function () {

        var membershipTab,
            tierAmount = {
                tier1: 500,
                tier0: 0
            },
            months = [
                'January',
                'Feburary',
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
            ];

        beforeEach(function () {
            membershipTab = new MembershipTab();
        });

        it('formatDate method correctly formats the date', function () {

            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(function (month) {
                var date = new Date(2046, month, 17),
                    formattedDate = membershipTab.formatDate(date);

                expect(formattedDate).not.toBeUndefined();
                expect(typeof formattedDate).toEqual('string');
                expect(formattedDate).toEqual('17 ' + months[month] + ' 2046');
            });
        });

        it('formatAmount method returns correct formatted amount for paid tier', function () {
            var formattedAmount = membershipTab.formatAmount(tierAmount.tier1);

            expect(formattedAmount).not.toBeUndefined();
            expect(typeof formattedAmount).toEqual('string');
            expect(formattedAmount).toEqual('5.00');
        });

        it('formatAmount method returns correct formatted amount for free tier', function () {
            var formattedAmount = membershipTab.formatAmount(tierAmount.tier0);

            expect(formattedAmount).not.toBeUndefined();
            expect(typeof formattedAmount).toEqual('string');
            expect(formattedAmount).toEqual('free');
        });
    });
});