import { mediator } from 'lib/mediator';

const setCount = (count, title) => {
    document.title = count > 0 ? `(${count}) ${title}` : title;
};

const initNotificationCounter = () => {
    const ORIGINAL_PAGETITLE = document.title;

    mediator.on('modules:autoupdate:unread', count => {
        setCount(count, ORIGINAL_PAGETITLE);
    });
};

export { initNotificationCounter };
