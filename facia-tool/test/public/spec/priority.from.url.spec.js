import priority from 'utils/priority-from-url';

describe('Priority', function () {
    it('gets the priority from URL', function () {
        expect(priority('/editorial')).toBeUndefined();
        expect(priority('/commercial/')).toBe('commercial');
        expect(priority('/training/config')).toBe('training');
    });
});
