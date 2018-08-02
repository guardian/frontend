// @flow
import { _ } from 'commercial/modules/dfp/Advert';

const { filterClasses } = _;

jest.mock('ophan/ng', () => null);

describe('Filter classes', () => {
    it('should return nil for empty class lists', () => {
        let result = filterClasses([], []);
        expect(result.length).toBe(0);
    });

    it('should return one class to be removed', () => {
        let result = filterClasses(['old-class'], []);
        expect(result.length).toBe(1);
        expect(result).toContain('old-class');
    });

    it('should return nil classes to be removed', () => {
        let result = filterClasses([], ['new-class']);
        expect(result.length).toBe(0);
    });

    it('should remove two unused classes', () => {
        let result = filterClasses(['old-class', 'old-class-2', 'old-class-3'], ['old-class-2']);
        expect(result.length).toBe(2);
        expect(result).toContain('old-class');
        expect(result).toContain('old-class-3');
    });
});