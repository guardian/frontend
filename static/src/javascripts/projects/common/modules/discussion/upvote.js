// @flow
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';
import { getUrlVars, constructQuery } from 'lib/url';

const RECOMMENDATION_CLASS = 'js-recommend-comment';
const TOOLTIP_CLASS = 'js-rec-tooltip';

const updateReturnUrl = (links, returnLink) => {
    for (let i = 0, len = links.length; i < len; i += 1) {
        const url = links[i].getAttribute('href');
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
};

const showSignInTooltip = target => {
    const tooltip = document.querySelector(`.${TOOLTIP_CLASS}`);
    const links = tooltip.querySelectorAll('.js-rec-tooltip-link');

    return fastdom.write(() => {
        updateReturnUrl(links, target.getAttribute('data-comment-url'));
        tooltip.removeAttribute('hidden');
        target.appendChild(tooltip);
    });
};

const isOpenForRecommendations = element =>
    !!element.querySelector('.d-discussion--recommendations-open');

const setClicked = target =>
    fastdom.write(() => {
        target.classList.remove(RECOMMENDATION_CLASS);
        target.classList.add('d-comment__recommend--clicked');
    });

const unsetClicked = target =>
    fastdom.write(() => {
        target.classList.add(RECOMMENDATION_CLASS);
        target.classList.remove('d-comment__recommend--clicked');
    });

const setRecommended = target =>
    fastdom.write(() => {
        target.classList.add('d-comment__recommend--recommended');
    });

const handle = (
    target,
    container,
    user,
    discussionApi,
    allowAnonymousRecommends
) => {
    if (!allowAnonymousRecommends && !user) {
        target.setAttribute('data-link-name', 'Recommend comment anonymous');
        return showSignInTooltip(target);
    } else if (
        (allowAnonymousRecommends || user) &&
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

const closeTooltip = () =>
    fastdom.write(() => {
        document.querySelector(`.${TOOLTIP_CLASS}`).setAttribute('hidden', '');
    });

export { handle, closeTooltip };
