import {
    trackSamePageLinkClick,
    trackExternalLinkClick,
    trackSponsorLogoLinkClick,
} from 'common/modules/analytics/google';
import { mediator } from 'lib/mediator';
import { storage } from '@guardian/libs';

import interactionTracking from './interaction-tracking';

jest.mock('lib/raven');

jest.mock('common/modules/analytics/google', () => ({
    trackSamePageLinkClick: jest.fn(),
    trackExternalLinkClick: jest.fn(),
    trackSponsorLogoLinkClick: jest.fn(),
}));

describe('interaction-tracking', () => {
    afterEach(() => {
        storage.session.remove('gu.analytics.referrerVars');
        mediator.removeEvent('module:clickstream:interaction');
        mediator.removeEvent('module:clickstream:click');
    });

    test('should log a clickstream event for an in-page link', () => {
        interactionTracking.init();

        mediator.emit('module:clickstream:click', {
            target: document.documentElement,
            samePage: true,
            sameHost: true,
            validTarget: true,
            tag: true,
        });

        expect(trackSamePageLinkClick).toHaveBeenCalledTimes(1);
    });

    test('should not log clickstream events with an invalidTarget', () => {
        interactionTracking.init();

        mediator.emit('module:clickstream:click', {
            target: document.documentElement,
            samePage: true,
            sameHost: true,
            validTarget: false,
            tag: true,
        });

        expect(trackSamePageLinkClick).toHaveBeenCalledTimes(1);
    });

    test('should use local storage for same-host links', () => {
        const pathName = '/foo/bar';
        const tagName = 'tag in localstorage';

        interactionTracking.init({ location: { pathname: pathName } });

        mediator.emit('module:clickstream:click', {
            target: document.createElement('a'),
            samePage: false,
            sameHost: true,
            validTarget: true,
            tag: tagName,
        });

        const referrerVars = storage.session.get('gu.analytics.referrerVars');

        expect(referrerVars.tag).toEqual(tagName);
        expect(referrerVars.path).toEqual(pathName);
    });

    test('should log a clickstream event for an external link', () => {
        interactionTracking.init();

        mediator.emit('module:clickstream:click', {
            target: document.createElement('a'),
            samePage: false,
            sameHost: false,
            validTarget: true,
            tag: 'tag',
        });

        expect(trackExternalLinkClick).toHaveBeenCalledTimes(1);
    });

    test('should log a clickstream event for a sponsor logo link', () => {
        interactionTracking.init();

        const el = document.createElement('a');
        el.setAttribute('data-sponsor', 'Sponsor');

        mediator.emit('module:clickstream:click', {
            target: el,
            samePage: false,
            sameHost: false,
            validTarget: true,
            tag: 'tag',
        });

        expect(trackSponsorLogoLinkClick).toHaveBeenCalledTimes(1);
    });
});
