// @flow

export const epicArticlesViewedOptOut = (count: number): string => `
    <span class="epic-article-count">
        <input type="checkbox" id="epic-article-count__reveal-reminder" class="epic-article-count__reveal-reminder" />
        <label for="epic-article-count__reveal-reminder" class="epic-article-count__prompt-label">
            <a>${count.toString()}</a>
        </label>
        <span class="epic-article-count__dialog">
            <span class="epic-article-count__dialog-header">What's this?</span>
            <span class="epic-article-count__dialog-body">Using your cookie consent, we can remind you how many Guardian articles you've enjoyed on this device. Can we continue showing you this?</span>
            
            <span class="epic-article-count__buttons">
                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-out"
                  href=""
                  target="_blank">
                  No, opt me out
                </a>
                
                <a class="component-button component-button--hasicon-right contributions__contribute--epic-member epic-article-count__button-opt-in"
                  href=""
                  target="_blank">
                  Yes, that's OK
                </a>
            </span>
            
            <span class="epic-article-count__dialog-note">Please note you cannot undo this action or opt back in</span>
        </span>
    </span>
`;
