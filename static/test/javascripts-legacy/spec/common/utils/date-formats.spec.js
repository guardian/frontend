define(['common/utils/date-formats'], function (dateFormats) {
    describe('utcDateString', function () {
        it('should return a UTC date string', function () {
            expect(dateFormats.utcDateString(1432644175000)).toBe('2015/05/26');
        });
    });
});
