// @flow

import bonzo from 'bonzo';
import Component from 'common/modules/component';
import detect from 'lib/detect';
import $ from 'lib/$';

const getScoreContainerHtml = (context: Object): string => `
    <div class="score-container">
        <div class="score__loading ${context.loadingState}">
            <div class="loading__text">Fetching the scores…</div>
            <div class="is-updating"></div>
        </div>
    </div>
`;

class ScoreBoard extends Component {
    constructor(context: Object): void {
        super(context);

        const scoreContainerHtml = getScoreContainerHtml({
            loadingState: this.pageType !== 'report'
                ? ' score__loading--live'
                : '',
        });

        this.componentClass = 'match-summary';
        this.pageType = context.pageType;
        this.parent = context.parent;
        this.endpoint = context.endpoint;
        this.autoupdated = context.autoupdated;
        this.responseDataKey = context.responseDataKey;
        this.updateEvery = detect.isBreakpoint({ min: 'desktop' }) ? 30 : 60;
        this.placeholder = bonzo.create(scoreContainerHtml)[0];

        if (this.pageType === 'report') {
            context.parent.after(this.placeholder);
        } else {
            context.parent.addClass('u-h').before(this.placeholder);
        }
    }

    autoupdated: boolean;
    componentClass: string;
    pageType: 'minbymin' | 'preview' | 'report' | 'stats';
    placeholder: HTMLElement;
    parent: bonzo;
    responseDataKey: string;
    endpoint: string;
    updateEvery: number;

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

export default ScoreBoard;
