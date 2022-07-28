import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';
import { isBreakpoint, getBreakpoint } from 'lib/detect';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import reportError from 'lib/report-error';
import { spaceFiller } from 'common/modules/article/space-filler';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

const richLinkTag = ({ href }) =>
    `<aside class=" element element-rich-link element-rich-link--tag
                    element--thumbnail element-rich-link--not-upgraded"
            data-component="rich-link-tag"
            data-link-name="rich-link-tag"
            >
        <p><a href="${href}">${href}</a></p>
    </aside>`;

const hideIfPaidForAndAdFree = (el) => {
    if (!commercialFeatures.adFree) {
        return Promise.resolve();
    }
    return fastdom.mutate(() => {
        [...el.children]
            .filter(child =>
                child.classList.toString().includes('rich-link--paidfor')
            )
            .forEach(child => child.classList.add('u-h'));
    });
};

const elementIsBelowViewport = (el) =>
    fastdom.measure(() => {
        const rect = el.getBoundingClientRect();
        const height =
            window.innerHeight ||
            (document.documentElement &&
                document.documentElement.clientHeight) ||
            0;
        return rect.top > height;
    });

const doUpgrade = (el, resp) =>
    fastdom.mutate(() => {
        el.innerHTML = resp.html;
        el.classList.remove('element-rich-link--not-upgraded');
        el.classList.add('element-rich-link--upgraded');
        Array.from(
            document.getElementsByClassName('submeta-container--break')
        ).forEach(sel => {
            sel.classList.remove('submeta-container--break');
        });
        document.dispatchEvent(new CustomEvent('rich-link:loaded'));
    });

const upgradeRichLink = (el) => {
    const link = (el.querySelector('a'));

    if (!link) return Promise.resolve();

    const href = link.href;
    const host = config.get('page.host');
    const matches = href.split(host);
    const isOnMobile = isBreakpoint({
        max: 'mobileLandscape',
    });

    if (matches && matches[1]) {
        return fetchJson(`/embed/card${matches[1]}.json`, {
            mode: 'cors',
        })
            .then(resp => {
                if (resp.html) {
                    // Fastdom read the viewport height before upgrading if on mobile
                    if (isOnMobile) {
                        elementIsBelowViewport(el).then(shouldUpgrade => {
                            if (shouldUpgrade) {
                                doUpgrade(el, resp);
                            }
                        });
                    } else {
                        doUpgrade(el, resp);
                    }
                    hideIfPaidForAndAdFree(el); // only identifiable as paid-for when upgraded
                }
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'rich-links',
                });
            });
    }

    return Promise.resolve();
};

const getSpacefinderRules = () => ({
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 200,
    minBelow: 250,
    clearContentMeta: 50,
    selectors: {
        ' > h2': {
            minAbove: getBreakpoint() === 'mobile' ? 20 : 0,
            minBelow: 200,
        },
        ' > *:not(p):not(h2):not(blockquote)': {
            minAbove: 35,
            minBelow: 300,
        },
        ' .ad-slot': {
            minAbove: 150,
            minBelow: 200,
        },
        ' .element-rich-link': {
            minAbove: 500,
            minBelow: 500,
        },
        ' .element--showcase': {
            minAbove: ['desktop', 'leftCol', 'wide'].includes(getBreakpoint())
                ? 200
                : 0,
            minBelow: 0,
        }
    },
});

// Tag-targeted rich links can be absolute
const testIfDuplicate = (richLinkHref) =>
    richLinkHref.includes(config.get('page.richLink'));

const insertTagRichLink = () => {
    let insertedEl;

    const richLinkHrefs = Array.from(
        document.querySelectorAll('.element-rich-link a')
    ).map((el) => (el).href);

    const isDuplicate = richLinkHrefs.some(testIfDuplicate);
    const isSensitive =
        config.get('page.shouldHideAdverts') ||
        !config.get('page.showRelatedContent');
    // Richlinks are just generally unhappy in numbered list articles
    // Example https://theguardian.com/environment/2020/jun/19/why-you-should-go-animal-free-arguments-in-favour-of-meat-eating-debunked-plant-based
    const isNumberedListArticle = document.querySelectorAll('.js-article__body--type-numbered-list').length > 0;

    if (
        config.get('page.richLink') &&
        !config.get('page.richLink').includes(config.get('page.pageId')) &&
        !isSensitive &&
        !isDuplicate &&
        !isNumberedListArticle
    ) {
        return spaceFiller
            .fillSpace(getSpacefinderRules(), (paras) => {
                const html = richLinkTag({
                    href: config.get('page.richLink'),
                });
                return fastdom.mutate(() => {
                    paras[0].insertAdjacentHTML('beforebegin', html);
                    insertedEl = paras[0].previousElementSibling;
                });
            })
            .then(didInsert => {
                if (didInsert && insertedEl) {
                    return upgradeRichLink(insertedEl);
                }
            });
    }

    return Promise.resolve();
};

const upgradeRichLinks = () => {
    Array.from(
        document.getElementsByClassName('element-rich-link--not-upgraded')
    ).forEach(upgradeRichLink);
};

export {
    richLinkTag,
    upgradeRichLinks,
    insertTagRichLink,
    getSpacefinderRules,
};
