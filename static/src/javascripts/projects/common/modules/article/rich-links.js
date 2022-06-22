import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import reportError from 'lib/report-error';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

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

const richLinkTag = ({ href }) =>
    `<aside class=" element element-rich-link element-rich-link--tag
                    element--thumbnail element-rich-link--not-upgraded"
            data-component="rich-link-tag"
            data-link-name="rich-link-tag"
            >
        <p><a href="${href}">${href}</a></p>
    </aside>`;

const upgradeRichLinks = () => {
    Array.from(
        document.getElementsByClassName('element-rich-link--not-upgraded')
    ).forEach(upgradeRichLink);
};

export {
    richLinkTag,
    upgradeRichLinks,
};
