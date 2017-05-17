// @flow
import { getBanners } from './adblock-banner-config';

jest.mock('./adblock-banners', () => ({
    banners: [
        {
            template: 'test-template',

            defaults: {
                name: 'City',
            },
            variants: [
                {
                    varName: 'Variant 1',
                },
                {
                    varName: 'Variant 2',
                },
            ],
            editions: {
                UK: {
                    city: 'London',
                },
                US: {
                    city: 'New York',
                },
            },
        },
    ],
}));

describe('Adblock configuration rules', () => {
    const ukBanners = getBanners('UK');
    const usBanners = getBanners('US');
    const intBanners = getBanners('INT');

    it('should return no banners given no locale', () => {
        expect(getBanners('')).toEqual([]);
    });

    it('should return one set of banners for the UK', () => {
        expect(ukBanners.length).toBe(1);
    });

    it('should return one set of banners for the US', () => {
        expect(usBanners.length).toBe(1);
    });

    it('should return all the variants of each banner type', () => {
        expect(usBanners[0].length).toEqual(2);
        expect(ukBanners[0].length).toEqual(2);
    });

    it('should include all the common config in each banner', () => {
        ukBanners[0].forEach(variant => {
            expect(variant.name).toEqual('City');
        });
    });

    it('should include all the variant config in each banner', () => {
        ukBanners[0].forEach((variant, v) => {
            expect(variant).toEqual(
                expect.objectContaining({
                    varName: `Variant ${v + 1}`,
                })
            );
        });
    });

    it('should merge edition based config into each banner variant', () => {
        ukBanners[0].forEach(variant => {
            expect(variant).toEqual(
                expect.objectContaining({ city: 'London' })
            );
        });
    });

    it('should skip banners which do not have a locale configured', () => {
        expect(intBanners.length).toBe(0);
    });

    it('should add the template and edition to each variant of the banner config for simplicity', () => {
        expect(usBanners[0][0].template).toEqual('test-template');
        expect(usBanners[0][0].edition).toEqual('US');
    });
});
