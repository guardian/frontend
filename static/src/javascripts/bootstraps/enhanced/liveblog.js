import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import { mediator } from 'lib/mediator';
import { upgradeRichLinks } from 'common/modules/article/rich-links';
import { Affix } from 'common/modules/experiments/affix';
import { autoUpdate } from 'common/modules/ui/autoupdate';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import { initTrails } from 'bootstraps/enhanced/trail';
import { catchErrorsWithContext } from 'lib/robust';
import bean from 'bean';
import { scrollToElement } from 'lib/scroller';
import { elementInView } from 'lib/element-inview';
import ophan from 'ophan/ng';
import { measureTiming } from "commercial/modules/measure-timing";

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
				'.js-live-blog__sticky-components-container',
			),
			topMarker: document.querySelector('.js-top-marker'),
			bottomMarker: document.querySelector('.js-bottom-marker'),
			containerElement: document.querySelector(
				'.js-live-blog__sticky-components',
			),
		});
	}
};

const initFilterCheckbox = () => {
	const filterKeyEvents = window.location.search.includes(
		'filterKeyEvents=true',
	);
	const filterSwitch = document.getElementById('filter-switch');

	if (filterSwitch) {
		filterSwitch.checked = filterKeyEvents;
	}
};

const createAutoUpdate = () => {
	if (config.get('page.isLive')) {
		autoUpdate();
	}
};

const keepTimestampsCurrent = () => {
	window.setInterval(() => initRelativeDates(), 60000);
};

const isVisible = (element) => {
	const position = element && element.getBoundingClientRect();
	return (
		position && position.top >= 0 && position.bottom <= window.innerHeight
	);
};

const cleanId = (blockIdString) => {
	return blockIdString.substring(0, blockIdString.indexOf('-pinned'));
};

const componentEvent = (pinnedBlockId, action, value) => ({
    componentEvent: {
        component: {
            componentType: 'LIVE_BLOG_PINNED_POST',
            id: pinnedBlockId,
        },
        action: action,
        ...value
    }
});

const trackOphanPinnedDuration = (pinnedBlockId, duration) => {
    console.log(`original pinned post in view with id ${pinnedBlockId} for ${duration} millisecond`);
    ophan.record(componentEvent(pinnedBlockId, 'DURATION', {value: duration}))
};

const initTracking = () => {
	const pinnedBlock = document.getElementById('pinned-block');
	if (pinnedBlock) {
		const pinnedBlockId = cleanId(pinnedBlock.dataset.blockId);

		ophan.record(componentEvent(pinnedBlockId, 'INSERT'));
		const inView = elementInView(pinnedBlock, window, {
			top: 18,
		});

		inView.on('firstview', () => {
			ophan.record(componentEvent(pinnedBlockId, 'VIEW'));
		});
	}

	// pinned post duration tracking
    let hasBeenSeen = false;
    const pinnedPostTiming = measureTiming('pinned-post-view-duration');
    const originalPinnedBlockId = pinnedBlock.dataset.blockId
    const onIntersect = (entries) => {
        entries
            .forEach((entry) => {
                if (entry.isIntersecting) {
                    hasBeenSeen = true;
                    pinnedPostTiming.clear();
                    pinnedPostTiming.start();
                } else if (hasBeenSeen) {
                    const timeTaken = pinnedPostTiming.end();
                    if (timeTaken) {
                        trackOphanPinnedDuration(originalPinnedBlockId, timeTaken);
                    }
                }
            });
    };
    const observer = new IntersectionObserver(onIntersect, {
        threshold: 0.8,
    });
    observer.observe(pinnedBlock);
};

const trackOphanClick = (pinnedBlockId, clickValue) => {
    ophan.record(componentEvent(pinnedBlockId, 'CLICK', {value: clickValue}));
};

const setupListeners = () => {
	const pinnedBlockButton = document.querySelector('.pinned-block__button');

	bean.on(document.body, 'change', '.live-blog__filter-switch-label', () => {
		const hasParam =
			window.location.search.includes(`filterKeyEvents=true`);
		const param = `?filterKeyEvents=${
			hasParam ? 'false' : 'true'
		}#liveblog-content`;
		window.location.assign(`${window.location.pathname}${param}`);
	});

	bean.on(document.body, 'click', '.pinned-block__label', () => {

        //scroll to element top on close if out of view.
		const pinnedBlockHeader = document.querySelector(
			'.pinned-block__header',
		);
		if (!isVisible(pinnedBlockHeader) && pinnedBlockButton.checked)
			scrollToElement(pinnedBlockHeader);
	});

	bean.on(document.body, 'click', '.pinned-block__label', () => {
		const pinnedBlock = document.getElementById('pinned-block');
		const pinnedBlockId = cleanId(pinnedBlock?.dataset?.blockId);
		pinnedBlockId && pinnedBlockButton.checked
			? trackOphanClick(pinnedBlockId, 'show-less')
			: trackOphanClick(pinnedBlockId, 'show-more');
	});
};

const init = () => {
	catchErrorsWithContext([
		['lb-listeners', setupListeners],
		['lb-filter', initFilterCheckbox],
		['lb-autoupdate', createAutoUpdate],
		['lb-timeline', affixTimeline],
		['lb-timestamp', keepTimestampsCurrent],
		['lb-richlinks', upgradeRichLinks],
		['lb-tracking', initTracking],
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

export { init };
