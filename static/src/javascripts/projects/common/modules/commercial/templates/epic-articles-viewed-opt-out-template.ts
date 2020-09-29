
import closeIcon from "svgs/icon/close-large.svg";

export const epicArticlesViewedOptOutTemplate = (count: number, nextWord: string | null | undefined): string => `
    <span class="epic-article-count">
        <input type="checkbox" id="epic-article-count__dialog-checkbox" class="epic-article-count__dialog-checkbox" />
        <label for="epic-article-count__dialog-checkbox" class="epic-article-count__prompt-label">
            <a>${count.toString()}${nextWord ? ` ${nextWord}` : ''}</a>
        </label>
        <span class="epic-article-count__dialog">
            <span class="epic-article-count__dialog-close is-hidden">
                <button tabindex="4" class="epic-article-count__dialog-close-button js-site-message-close" data-link-name="hide release message">
                    <span class="u-h">Close the articles viewed opt out message</span>
                    ${closeIcon.markup}
                </button>
            </span>
        
            <span class="epic-article-count__dialog-header">What's this?</span>
            <span class="epic-article-count__dialog-body">We would like to remind you how many Guardian articles you've enjoyed on this device. Can we continue showing you this?</span>
            
            <span class="epic-article-count__buttons">
                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-in"
                  target="_blank">
                  Yes, that's OK
                </a>

                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-out"
                  target="_blank">
                  No, opt me out
                </a>
            </span>
            
            <span class="epic-article-count__dialog-note">Please note you cannot undo this action or opt back in</span>
        </span>
    </span>
`;