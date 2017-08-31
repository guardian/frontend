// @flow

import config from 'lib/config';
import Expandable from 'common/modules/ui/expandable';
import { related } from './related';

jest.mock('lib/config');
jest.mock('common/modules/ui/expandable', () => {
    const Exp: any = (jest.fn(): any);
    Exp.prototype.init = jest.fn();
    return Exp;
});
jest.mock('common/modules/analytics/register', () => ({
    begin() {},
    end() {},
    error() {},
}));

describe('onward/related', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <div class="js-related lazyloaded"></div>
                <div class="related-trails"></div>
            `;
        }

        config.page = {
            hasStoryPackage: false,
            showRelatedContent: true,
        };
        config.switches = {
            relatedContent: true,
            ajaxRelatedContent: true,
        };
        jest.resetAllMocks();
        jest.resetModules();
    });

    it("should hide if there's no story package and related can't be fetched", () => {
        const container: HTMLElement = (document.querySelector(
            '.js-related'
        ): any);

        config.switches.relatedContent = false;

        related({});

        expect(container.classList.contains('u-h')).toBe(true);
    });

    it('should create expandable if page has story package', () => {
        config.page.hasStoryPackage = true;

        related({});

        expect(Expandable).toHaveBeenCalledWith({
            dom: document.querySelector('.related-trails'),
            expanded: false,
            showCount: false,
        });
    });
});
