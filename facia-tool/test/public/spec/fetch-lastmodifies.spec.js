define([
    'mock/lastmodified',
    'utils/fetch-lastmodified'
], function (
    mock,
    lastModified
) {
    describe('Last Modified', function () {
        it('fetches the last time', function (done) {
            var now = new Date();

            mock.set({
                'this/front': now.toISOString()
            });
            lastModified('this/front').done(function (result) {
                expect(result).toEqual({
                    date: now,
                    human: 'just now',
                    stale: false
                });

                done();
            });
        });

        it('fetches a stale date', function (done) {
            var past = new Date();
            past.setFullYear(past.getFullYear() - 1);

            mock.set({
                'this/front': past.toISOString()
            });
            lastModified('this/front').done(function (result) {
                expect(result).toEqual({
                    date: past,
                    human: '1 year ago',
                    stale: true
                });

                done();
            });
        });
    });
});
