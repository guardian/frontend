// @flow
import { _ } from 'commercial/modules/dfp/Advert';

const { filterClasses } = _;

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

describe('Filter classes', () => {
    it('should return nil for empty class lists', () => {
        const result = filterClasses([], []);
        expect(result.length).toBe(0);
    });

    it('should return one class to be removed', () => {
        const result = filterClasses(['old-class'], []);
        expect(result.length).toBe(1);
        expect(result).toContain('old-class');
    });

    it('should return nil classes to be removed', () => {
        const result = filterClasses([], ['new-class']);
        expect(result.length).toBe(0);
    });

    it('should remove two unused classes', () => {
        const result = filterClasses(
            ['old-class', 'old-class-2', 'old-class-3'],
            ['old-class-2']
        );
        expect(result.length).toBe(2);
        expect(result).toContain('old-class');
        expect(result).toContain('old-class-3');
    });
});
