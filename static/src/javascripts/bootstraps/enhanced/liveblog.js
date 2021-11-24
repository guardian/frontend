import config from 'lib/config';
import {isBreakpoint} from 'lib/detect';
import mediator from 'lib/mediator';
import {upgradeRichLinks} from 'common/modules/article/rich-links';
import {Affix} from 'common/modules/experiments/affix';
import {autoUpdate} from 'common/modules/ui/autoupdate';
import {init as initRelativeDates} from 'common/modules/ui/relativedates';
import {init as initLiveblogCommon} from 'bootstraps/enhanced/article-liveblog-common';
import {initTrails} from 'bootstraps/enhanced/trail';
import {catchErrorsWithContext} from 'lib/robust';
import bean from "bean";
import {scrollToElement} from "lib/scroller";

const affixTimeline = () => {
    const keywordIds = config.get('page.keywordIds', '');

    if (
        isBreakpoint({
            min: 'desktop',
        }) &&
        !keywordIds.includes('football/football') &&
        !keywordIds.includes('sport/rugby-union')
    ) {
        // eslint-disable-next-line no-new
        new Affix({
            element: document.querySelector(
                '.js-live-blog__sticky-components-container'
            ),
            topMarker: document.querySelector('.js-top-marker'),
            bottomMarker: document.querySelector('.js-bottom-marker'),
            containerElement: document.querySelector(
                '.js-live-blog__sticky-components'
            ),
        });
    }
};

const initFilterCheckbox = () => {
    const filterKeyEvents = window.location.search.includes('filterKeyEvents=true');
    const filterSwitch = document.getElementById("filter-switch");

    if (filterSwitch) {
        filterSwitch.checked = filterKeyEvents;
    }
}

const initAccessibleClickListener = (label) => {
    const spacebar = 32
    const enter = 13
    label.addEventListener('keydown', e => {
        if (e.which === spacebar || e.which === enter) {
            e.preventDefault();
            label.click();
        };
    });
}

const initPinnedBlock = () => {
    const pinnedBlock = document.querySelector('.pinned-block__body')
    const pinnedBlockBtn = document.querySelector('.pinned-block__btn')
    const overlay = document.querySelector('.pinned-block__overlay')

    const pinnedBlockHeight = pinnedBlock.offsetHeight;
    const minCollapsedHeight = document.documentElement.clientHeight * .30

    if (pinnedBlockHeight <= minCollapsedHeight) {
        overlay.style.display = "none"
        pinnedBlockBtn.style.display = "none"
    }
    initAccessibleClickListener(pinnedBlockBtn)

}

const createAutoUpdate = () => {
    if (config.get('page.isLive')) {
        autoUpdate();
    }
};

const keepTimestampsCurrent = () => {
    window.setInterval(() => initRelativeDates(), 60000);
};

const setupListeners = () => {
    bean.on(document.body, 'change', '.live-blog__filter-switch-label', () => {
        const hasParam = window.location.search.includes(`filterKeyEvents=true`);
        const param = `?filterKeyEvents=${hasParam ? 'false' : 'true'}#liveblog-content`;
        window.location.assign(`${window.location.pathname}${param}`);
    })

    bean.on(document.body, 'click', '.pinned-block__btn', () => {
        const pinnedBlockTop = document.querySelector('.pinned-block__header')
        const pinnedBlockToggle = document.querySelector('.pinned-block__toggle')
        pinnedBlockToggle.checked && scrollToElement(pinnedBlockTop)
    })
}

const init = () => {
    catchErrorsWithContext([
        ['lb-listeners', setupListeners],
        ['lb-filter', initFilterCheckbox],
        ['lb-pinned', initPinnedBlock],
        ['lb-autoupdate', createAutoUpdate],
        ['lb-timeline', affixTimeline],
        ['lb-timestamp', keepTimestampsCurrent],
        ['lb-richlinks', upgradeRichLinks],
    ]);

    initTrails();
    initLiveblogCommon();
    catchErrorsWithContext([
        [
            'lb-ready',
            () => {
                mediator.emit('page:liveblog:ready');
            },
        ],
    ]);
};

export {init};
