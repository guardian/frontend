// @flow

import bonzo from 'bonzo';
import { Component } from 'common/modules/component';
import { isBreakpoint } from 'lib/detect';
import $ from 'lib/$';

type PageTypes = 'minbymin' | 'preview' | 'report' | 'stats';

type ScoreBoardContext = {
    autoupdated: boolean,
    pageType: PageTypes,
    placeholder?: HTMLElement,
    parent: bonzo,
    responseDataKey: string,
    updateEvery?: number,
};

const getScoreContainerHtml = (context: Object): string => `
    <div class="score-container">
        <div class="score__loading ${context.loadingState}">
            <div class="loading__text">Fetching the scores…</div>
            <div class="is-updating"></div>
        </div>
    </div>
`;

class ScoreBoard extends Component {
    constructor(context: ScoreBoardContext): void {
        super();

        Object.assign(this, context);

        const scoreContainerHtml = getScoreContainerHtml({
            loadingState:
                this.pageType !== 'report' ? ' score__loading--live' : '',
        });

        this.updateEvery = isBreakpoint({ min: 'desktop' }) ? 30 : 60;
        this.placeholder = bonzo.create(scoreContainerHtml)[0];

        if (this.pageType === 'report') {
            context.parent.after(this.placeholder);
        } else {
            context.parent.addClass('u-h').before(this.placeholder);
        }
    }

    placeholder: HTMLElement;
    pageType: PageTypes;
    parent: bonzo;

    prerender(): void {
        const scoreLoadingPlaceholder = $(
            '.score__loading',
            $(this.placeholder)
        );

        if (scoreLoadingPlaceholder.length) {
            scoreLoadingPlaceholder.remove();
        }
    }

    ready(): void {
        this.setState(this.pageType);
    }

    load(): void {
        this.fetch(this.placeholder);
    }

    loadFromJson(html: string): void {
        this.template = html;
        this.render(this.placeholder);
    }

    error(): void {
        this.placeholder.innerHTML = '';
        this.parent.removeClass('u-h');
    }
}

export { ScoreBoard };
