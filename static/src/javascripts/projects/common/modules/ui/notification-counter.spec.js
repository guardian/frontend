// @flow

import mediator from 'lib/mediator';
import { initNotificationCounter, _ } from './notification-counter';

jest.mock('lib/mediator');

describe('notification-counter', () => {
    const ORIGINAL_PAGETITLE = document.title;

    beforeEach(() => {
        document.title = ORIGINAL_PAGETITLE;
        initNotificationCounter();
    });

    it('should put a counter in the title bar', () => {
        _.setCount(2);
        expect(document.title).toContain('(2)');
    });

    it('should restore the title when counter set to 0', () => {
        _.setCount(0);
        expect(document.title).toBe(ORIGINAL_PAGETITLE);
    });

    it('should show an unread count when modules:autoupdate:unread is fired', () => {
        mediator.emit('modules:autoupdate:unread', 5);
        expect(document.title).toContain('(5)');
    });
});
