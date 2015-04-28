import Mock from 'mock/lastmodified';
import lastModified from 'utils/fetch-lastmodified';

describe('Last Modified', function () {
    beforeEach(function () {
        this.mock = new Mock();
    });
    afterEach(function () {
        this.mock.destroy();
    });

    it('fetches the last time', function (done) {
        var now = new Date();

        this.mock.set({
            'this/front': now.toISOString()
        });
        lastModified('this/front').then(function (result) {
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

        this.mock.set({
            'this/front': past.toISOString()
        });
        lastModified('this/front').then(function (result) {
            expect(result).toEqual({
                date: past,
                human: '1 year ago',
                stale: true
            });

            done();
        });
    });
});
