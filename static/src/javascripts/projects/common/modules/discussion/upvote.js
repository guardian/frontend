import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { reportError } from 'lib/report-error';
import { getUrlVars, constructQuery } from 'lib/url';
import { recommendComment } from 'common/modules/discussion/api';

const RECOMMENDATION_CLASS = 'js-recommend-comment';
const TOOLTIP_CLASS = 'js-rec-tooltip';

const updateReturnUrl = (
    links,
    returnLink
) => {
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

const showSignInTooltip = (target) => {
    const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);

    if (!tooltip) {
        return Promise.resolve();
    }

    const links = tooltip.querySelectorAll('.js-rec-tooltip-link');

    return fastdom.mutate(() => {
        updateReturnUrl(links, target.getAttribute('data-comment-url'));
        tooltip.removeAttribute('hidden');
        target.appendChild(tooltip);
    });
};

const isOpenForRecommendations = (element) =>
    !!element && !!element.querySelector('.d-discussion--recommendations-open');

const setClicked = (target) =>
    fastdom.mutate(() => {
        target.classList.remove(RECOMMENDATION_CLASS);
        target.classList.add('d-comment__recommend--clicked');
    });

const unsetClicked = (target) =>
    fastdom.mutate(() => {
        target.classList.add(RECOMMENDATION_CLASS);
        target.classList.remove('d-comment__recommend--clicked');
    });

const setRecommended = (target) =>
    fastdom.mutate(() => {
        target.classList.add('d-comment__recommend--recommended');
    });

const handle = (
    target,
    container,
    user
) => {
    const discussionAllowAnonymousRecommendsSwitch = config.get(
        'switches.discussionAllowAnonymousRecommendsSwitch'
    );
    if (!discussionAllowAnonymousRecommendsSwitch && !user) {
        target.setAttribute('data-link-name', 'Recommend comment anonymous');
        return showSignInTooltip(target);
    } else if (
        (discussionAllowAnonymousRecommendsSwitch || user) &&
        isOpenForRecommendations(container)
    ) {
        const id = target.getAttribute('data-comment-id');

        if (!id) {
            return Promise.resolve();
        }

        return Promise.all([setClicked(target), recommendComment(id)])
            .then(() => setRecommended(target))
            .catch(ex =>
                unsetClicked(target).then(() => {
                    reportError(ex, {
                        feature: 'comments-recommend',
                    });
                })
            );
    }

    return Promise.resolve();
};

const closeTooltip = () =>
    fastdom.mutate(() => {
        const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);

        if (tooltip) {
            tooltip.setAttribute('hidden', '');
        }
    });

export { handle, closeTooltip };
