// @flow
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';
import { getUrlVars, constructQuery } from 'lib/url';
import discussionApi from 'common/modules/discussion/api';
import config from 'lib/config';

const RECOMMENDATION_CLASS = 'js-recommend-comment';
const TOOLTIP_CLASS = 'js-rec-tooltip';

const updateReturnUrl = (
    links: NodeList<HTMLElement>,
    returnLink: ?string
): void => {
    for (let i = 0, len = links.length; i < len; i += 1) {
        const url = links[i].getAttribute('href');

        if (url) {
            const baseUrl = url.split('?')[0];
            const query = getUrlVars(url.split('?')[1] || '&');
            links[i].setAttribute(
                'href',
                `${baseUrl}?${constructQuery(
                    Object.assign({}, query, {
                        returnUrl: returnLink,
                    })
                )}`
            );
        }
    }
};

const showSignInTooltip = (target: Element): Promise<void> => {
    const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);

    if (!tooltip) {
        return Promise.resolve();
    }

    const links = tooltip.querySelectorAll('.js-rec-tooltip-link');

    return fastdom.write(() => {
        updateReturnUrl(links, target.getAttribute('data-comment-url'));
        tooltip.removeAttribute('hidden');
        target.appendChild(tooltip);
    });
};

const isOpenForRecommendations = (element: Element): boolean =>
    !!element.querySelector('.d-discussion--recommendations-open');

const setClicked = (target: Element): Promise<void> =>
    fastdom.write(() => {
        target.classList.remove(RECOMMENDATION_CLASS);
        target.classList.add('d-comment__recommend--clicked');
    });

const unsetClicked = (target: Element): Promise<void> =>
    fastdom.write(() => {
        target.classList.add(RECOMMENDATION_CLASS);
        target.classList.remove('d-comment__recommend--clicked');
    });

const setRecommended = (target: Element): Promise<void> =>
    fastdom.write(() => {
        target.classList.add('d-comment__recommend--recommended');
    });

type User = {
    userId: string,
    displayName: string,
    webUrl: string,
    apiUrl: string,
    avatar: string,
    secureAvatarUrl: string,
    badge: Array<string>,
    details: {
        gender: string,
    },
};

const handle = (
    target: Element,
    container: Element,
    user: User
): ?Promise<void> => {
    if (!config.switches.discussionAllowAnonymousRecommendsSwitch && !user) {
        target.setAttribute('data-link-name', 'Recommend comment anonymous');
        return showSignInTooltip(target);
    } else if (
        (config.switches.discussionAllowAnonymousRecommendsSwitch || user) &&
        isOpenForRecommendations(container)
    ) {
        const id = target.getAttribute('data-comment-id');

        return Promise.all([
            setClicked(target),
            discussionApi.recommendComment(id),
        ])
            .then(() => setRecommended(target))
            .catch(ex =>
                unsetClicked(target).then(() => {
                    reportError(ex, {
                        feature: 'comments-recommend',
                    });
                })
            );
    }
};

const closeTooltip = (): Promise<void> =>
    fastdom.write(() => {
        const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);

        if (tooltip) {
            tooltip.setAttribute('hidden', '');
        }
    });

export { handle, closeTooltip };
