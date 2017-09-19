// @flow

import mediator from 'lib/mediator';

const ORIGINAL_PAGETITLE = document.title;

const setCount = (count: number): void => {
    document.title =
        count > 0 ? `(${count}) ${ORIGINAL_PAGETITLE}` : ORIGINAL_PAGETITLE;
};

const initNotificationCounter = (): void => {
    mediator.on('modules:autoupdate:unread', count => {
        setCount(count);
    });
};

export { initNotificationCounter, setCount };

export const _ = {
    setCount,
};
