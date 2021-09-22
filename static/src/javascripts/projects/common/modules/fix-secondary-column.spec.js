import fastdom from 'lib/fastdom-promise';
import { fixSecondaryColumn, _ } from './fix-secondary-column';

const { calcShowcaseOffset } = _;

describe('calcShowcaseOffset', () => {
    it('should return the correct number based on the dimensions provided', () => {
        expect(
            calcShowcaseOffset(
                { top: 440, height: 770 },
                { top: 330, height: 2000 }
            )
        ).toBe(880);
    });
});

describe('fixSecondaryColumn when there is no showcase element', () => {
    const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
            </div>
        </div>
    `;

    beforeEach(() => {
        jest.resetAllMocks();
        if (document.body) {
            document.body.innerHTML = domSnippet;
        }
    });

    it('should do nothing if a showcase element does not exist', () => {
        fixSecondaryColumn();
        
        const col = document.querySelector('.js-secondary-column');
        expect(col.style.paddingTop).toBe('');
    });
});

describe('fixSecondaryColumn when showcase element is present', () => {
    const showcaseDomSnippet = `
        <div class="js-content-main-column">
            <figure class="media-primary--showcase"></figure>
        </div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
            </div>
        </div>
    `;

    beforeEach(() => {
        jest.resetAllMocks();
        if (document.body) {
            document.body.innerHTML = showcaseDomSnippet;
        }
    });

    it('should set the padding-top of the secondary column to the correct value', done => {
        jest.spyOn(fastdom, 'measure').mockReturnValue(Promise.resolve(880));

        fastdom
            .mutate(() => {
                fixSecondaryColumn();
            })
            .then(() => {
                
                const secondaryCol = document.querySelector(
                    '.js-secondary-column'
                );
                expect(secondaryCol.style.paddingTop).toEqual('880px');
                done();
            });
    });
});
