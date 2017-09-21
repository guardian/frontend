// @flow
import bean from 'bean';
import { getUrlVars } from 'lib/url';
import { ActivityStream } from 'common/modules/discussion/activity-stream';

const getActivityStream = (cb: Function): void => {
    const dataOpts = {
        userId: 'data-user-id',
        streamType: 'data-stream-type',
    };

    const streamElem = document.getElementsByClassName('js-activity-stream')[0];

    if (!streamElem) {
        return;
    }

    const opts = Object.keys(dataOpts).reduce((acc, key) => {
        acc[key] = streamElem.getAttribute(dataOpts[key]);

        return acc;
    }, {});

    opts.page = getUrlVars().page || 1;

    const activityStream = new ActivityStream(opts);

    streamElem.classList.add('activity-stream--loading');

    activityStream.fetch(streamElem).then(() => {
        streamElem.classList.remove('activity-stream--loading');
    });

    cb(activityStream);
};

const selectTab = (el: HTMLElement): void => {
    const selectedTabs = document.getElementsByClassName('tabs__tab--selected');

    [...selectedTabs].forEach(selectedTab => {
        selectedTab.classList.remove('tabs__tab--selected');
    });

    if (el.parentElement) {
        el.parentElement.classList.add('tabs__tab--selected');
    }
};

const setupActivityStreamChanger = (activityStream: ActivityStream): void => {
    bean.on(document.body, 'click', '.js-activity-stream-change', e => {
        const el: HTMLElement = (e.currentTarget: any);
        const streamType = el.getAttribute('data-stream-type');

        e.preventDefault();

        selectTab(el);

        activityStream.change({
            page: 1,
            streamType,
        });
    });
};

const setupActivityStreamSearch = (activityStream: ActivityStream): void => {
    bean.on(document.body, 'submit', '.js-activity-stream-search', e => {
        const q = e.currentTarget.elements.q.value;
        const anchor = document.querySelector(
            'a[data-stream-type="discussions"]'
        );

        e.preventDefault();

        if (anchor) {
            selectTab(anchor);
        }

        activityStream.change({
            streamType:
                q !== '' ? `search/${encodeURIComponent(q)}` : 'comments',
        });
    });
};

const init = (): void => {
    getActivityStream(activityStream => {
        setupActivityStreamChanger(activityStream);
        setupActivityStreamSearch(activityStream);
    });
};

export { init };
