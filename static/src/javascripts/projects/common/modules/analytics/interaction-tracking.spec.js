import { mediator } from 'lib/mediator';
import { storage } from '@guardian/libs';

import interactionTracking from './interaction-tracking';

jest.mock('lib/raven');

describe('interaction-tracking', () => {
    afterEach(() => {
        storage.session.remove('gu.analytics.referrerVars');
        mediator.removeEvent('module:clickstream:interaction');
        mediator.removeEvent('module:clickstream:click');
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
});
