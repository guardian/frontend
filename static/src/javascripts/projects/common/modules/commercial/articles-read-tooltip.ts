

import { submitClickEvent } from "common/modules/commercial/acquisitions-ophan";
import { ARTICLES_VIEWED_OPT_OUT_COOKIE } from "common/modules/commercial/user-features";
import { storageKeyWeeklyArticleCount, storageKeyDailyArticleCount } from "common/modules/onward/history";
import { addCookie } from "lib/cookies";
import { local } from "lib/storage";
import reportError from "lib/report-error";

type ArticlesViewedTooltipElements = {
  articlesRead: HTMLElement;
  wrapper: HTMLElement;
  optOutButton: HTMLElement;
  optInButton: HTMLElement;
  header: HTMLElement;
  body: HTMLElement;
  buttons: HTMLElement;
  note: HTMLElement;
  closeButton: HTMLElement;
};

const getElements = (container: HTMLElement): ArticlesViewedTooltipElements | null | undefined => {
  const articlesRead = container.querySelector('.engagement-banner__articles-read');
  const wrapper = container.querySelector('.engagement-banner__articles-read-tooltip');
  const buttons = container.querySelector('.engagement-banner__articles-read-tooltip-buttons');
  const optOutButton = container.querySelector('.engagement_banner__articles-read-tooltip-button-opt-out');
  const optInButton = container.querySelector('.engagement_banner__articles-read-tooltip-button-opt-in');
  const header = container.querySelector('.engagement-banner__articles-read-tooltip-header');
  const body = container.querySelector('.engagement-banner__articles-read-tooltip-body');
  const note = container.querySelector('.engagement-banner__articles-read-tooltip-note');
  const closeButton = container.querySelector('.engagement-banner__articles-read-tooltip-close');

  if (articlesRead && wrapper && buttons && optOutButton && optInButton && header && body && note && closeButton) {
    return {
      articlesRead,
      wrapper,
      buttons,
      optOutButton,
      optInButton,
      header,
      body,
      note,
      closeButton
    };
  }
};

const setupHandlers = (elements: ArticlesViewedTooltipElements) => {

  const showTooltip = () => {
    elements.articlesRead.classList.add('active');
    elements.wrapper.classList.add('active');
  };

  const hideTooltip = () => {
    elements.articlesRead.classList.remove('active');
    elements.wrapper.classList.remove('active');
  };

  const isActive = () => elements.wrapper.classList.contains('active');

  const toggleTooltip = () => isActive() ? hideTooltip() : showTooltip();

  const onArticlesReadClick = () => {
    toggleTooltip();
    submitClickEvent({
      component: {
        componentType: 'ACQUISITIONS_OTHER',
        id: 'banner-articles-viewed-opt-out_open'
      }
    });
  };

  const onOptOutClick = () => {
    submitClickEvent({
      component: {
        componentType: 'ACQUISITIONS_OTHER',
        id: 'banner-articles-viewed-opt-out_out'
      }
    });

    // Stop counting and clear the user's history
    addCookie(ARTICLES_VIEWED_OPT_OUT_COOKIE.name, new Date().getTime().toString(), ARTICLES_VIEWED_OPT_OUT_COOKIE.daysToLive);
    local.remove(storageKeyWeeklyArticleCount);
    local.remove(storageKeyDailyArticleCount);

    // Update the dialog message
    elements.buttons.remove();
    elements.header.innerHTML = `You've opted out`;
    elements.body.innerHTML = `Starting from your next page view, we won't count the articles you read or show you this message for three months.`;
    elements.note.innerHTML = `If you have any questions, please <a target="_blank" href="https://www.theguardian.com/help/contact-us">contact us</a>.`;
    elements.closeButton.classList.remove('is-hidden');
    elements.closeButton.addEventListener('click', () => {
      hideTooltip();
    });
  };

  const onOptInClick = () => {
    submitClickEvent({
      component: {
        componentType: 'ACQUISITIONS_OTHER',
        id: 'banner-articles-viewed-opt-out_in'
      }
    });

    hideTooltip();
  };

  elements.articlesRead.addEventListener('click', () => {
    onArticlesReadClick();
  });

  elements.optOutButton.addEventListener('click', (event: Event) => {
    event.preventDefault();
    onOptOutClick();
  });

  elements.optInButton.addEventListener('click', (event: Event) => {
    event.preventDefault();
    onOptInClick();
  });
};

const bannerSetupArticlesViewedOptOut = () => {
  // If this element exists then they're in the variant
  const articlesReadTooltipWrapper = document.querySelector('.engagement-banner__articles-read-tooltip-wrapper');

  if (articlesReadTooltipWrapper) {
    const elements: ArticlesViewedTooltipElements | null | undefined = getElements(articlesReadTooltipWrapper);

    if (elements) {
      setupHandlers(elements);
    } else {
      reportError(new Error(`Error setting up articles viewed opt-out in banner: unable to find all elements.`), {
        feature: 'banner'
      }, false);
    }
  }
};

export { bannerSetupArticlesViewedOptOut };